import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { SITE } from "@/lib/config";

export const runtime = "nodejs";

const schema = z.object({
  naam: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  bericht: z.string().trim().min(1).max(5000),
  // Honeypot. "hp_field" is the current name; "website" is still accepted
  // because a browser holding a cached copy of the old page keeps posting it.
  hp_field: z.string().optional().default(""),
  website: z.string().optional().default(""),
  // How long the visitor spent on the form, measured in the browser.
  elapsedMs: z.number().optional(),
  // Legacy: the browser's render timestamp. Kept only for cached clients, and
  // no longer compared against the server clock (see below).
  renderedAt: z.number().optional(),
});

const MIN_FILL_MS = 2000;

/**
 * Whether the submission looks like an instant machine post.
 *
 * `elapsedMs` is a duration measured entirely in the browser, so there are no
 * two clocks to disagree. The old check subtracted the browser's render
 * timestamp from the SERVER's clock, which meant any visitor whose device ran
 * fast produced a tiny or negative difference, looked like a bot, and had their
 * message dropped while being shown a success message. Josette's own machine hit
 * exactly this. A legacy `renderedAt` is therefore only trusted when it lands in
 * a sane range; anything else counts as clock skew, not as spam.
 */
function looksInstant(elapsedMs?: number, renderedAt?: number): boolean {
  if (typeof elapsedMs === "number") {
    return elapsedMs >= 0 && elapsedMs < MIN_FILL_MS;
  }
  if (typeof renderedAt === "number") {
    const diff = Date.now() - renderedAt;
    return diff >= 0 && diff < MIN_FILL_MS; // negative diff = skewed clock, not a bot
  }
  return false;
}

/* Best-effort in-memory rate limit. Fine for a single container; if the app is
   ever scaled horizontally, move this to a shared store (e.g. PocketBase/Redis). */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Te veel berichten in korte tijd. Probeer het straks opnieuw." },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Controleer de ingevulde velden." }, { status: 400 });
  }
  const { naam, email, bericht, hp_field, website, elapsedMs, renderedAt } = parsed.data;

  // Spam signals: honeypot filled, or submitted implausibly fast.
  const honeypot = (hp_field || website).trim();
  const instant = looksInstant(elapsedMs, renderedAt);
  if (honeypot !== "" || instant) {
    // Still answer "ok" so a bot learns nothing, but never drop a message
    // without a trace again: this branch discarding real mail in silence is the
    // reason a delivery problem was invisible for weeks. One line per drop, with
    // the deciding values, so the next report can be checked in seconds.
    console.warn(
      `[contact] dropped as spam: reason=${honeypot !== "" ? "honeypot" : "instant"} ` +
        `elapsedMs=${elapsedMs ?? "none"} renderedAtDiff=${
          typeof renderedAt === "number" ? Date.now() - renderedAt : "none"
        } naam=${JSON.stringify(naam)} email=${JSON.stringify(email)} ip=${ip}`,
    );
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || SITE.email;
  const from = process.env.CONTACT_FROM_EMAIL || "Portret door Josette <onboarding@resend.dev>";

  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not set");
    return NextResponse.json(
      { error: "De mailconfiguratie ontbreekt. Neem rechtstreeks contact op via e-mail." },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Nieuw bericht via de website — ${naam}`,
      text: `Naam: ${naam}\nE-mail: ${email}\n\nBericht:\n${bericht}`,
      html: `<h2>Nieuw bericht via de website</h2>
<p><strong>Naam:</strong> ${escapeHtml(naam)}<br/>
<strong>E-mail:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
<p style="white-space:pre-wrap">${escapeHtml(bericht)}</p>`,
    });
    if (error) throw new Error(error.message);
    // The Resend id makes a report ("I sent one and it never arrived") checkable
    // against their dashboard instead of guesswork.
    console.info(`[contact] sent id=${data?.id ?? "unknown"} to=${to} replyTo=${email}`);
  } catch (err) {
    console.error("[contact] send failed:", err);
    return NextResponse.json(
      { error: "Versturen mislukt. Probeer het later opnieuw." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
