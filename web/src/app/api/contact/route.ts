import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { SITE } from "@/lib/config";

export const runtime = "nodejs";

const schema = z.object({
  naam: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  bericht: z.string().trim().min(1).max(5000),
  website: z.string().optional().default(""), // honeypot
  renderedAt: z.number().optional(),
});

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
  const { naam, email, bericht, website, renderedAt } = parsed.data;

  // Spam signals: honeypot filled, or submitted implausibly fast (< 2s).
  const tooFast = typeof renderedAt === "number" ? Date.now() - renderedAt < 2000 : false;
  if (website.trim() !== "" || tooFast) {
    return NextResponse.json({ ok: true }); // pretend success, silently drop
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
    const { error } = await resend.emails.send({
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
  } catch (err) {
    console.error("[contact] send failed:", err);
    return NextResponse.json(
      { error: "Versturen mislukt. Probeer het later opnieuw." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
