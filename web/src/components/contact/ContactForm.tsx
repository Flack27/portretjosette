"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "submitting" | "success" | "error";
type Errors = { naam?: string; email?: string; bericht?: string };

const inputClass =
  "w-full rounded-[3px] border border-[#d9d3c4] bg-card-50 px-3.5 text-[15px] text-ink-900 transition-[border-color,box-shadow] duration-200 placeholder:text-muted-400 focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600";

const labelClass = "mb-2 block text-[13px] font-semibold text-ink-700";

/* A field in error and the sentence that explains it, kept in one place so the
   three fields cannot drift apart. */
const errorFieldClass = "border-red-800 focus:border-red-800 focus:ring-red-800";
const errorTextClass = "mt-1.5 text-[13px] text-red-800";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [errorMsg, setErrorMsg] = useState("");
  // Stamped on mount, not during render: reading the clock while rendering is
  // an impure call. The spam check only compares it at submit time, which is
  // always after mount, so the value it sees is unchanged.
  const renderedAt = useRef<number>(0);
  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const data = new FormData(form);
    const values = {
      naam: String(data.get("naam") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      bericht: String(data.get("bericht") ?? "").trim(),
      website: String(data.get("website") ?? ""), // honeypot
      renderedAt: renderedAt.current,
    };

    const next: Errors = {};
    if (!values.naam) next.naam = "Vul uw naam in.";
    if (!values.email) next.email = "Vul uw e-mailadres in.";
    else if (!EMAIL_RE.test(values.email)) next.email = "Vul een geldig e-mailadres in.";
    if (!values.bericht) next.bericht = "Schrijf een bericht.";
    setErrors(next);
    // Send focus to the first field that needs fixing, so a keyboard or screen
    // reader user is taken to the problem instead of having to hunt for it.
    const firstInvalid = (["naam", "email", "bericht"] as const).find((k) => next[k]);
    if (firstInvalid) {
      const field = form.elements.namedItem(firstInvalid);
      if (field instanceof HTMLElement) field.focus();
      return;
    }

    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Er ging iets mis. Probeer het later opnieuw.");
      }
      form.reset();
      setStatus("success");
    } catch (err) {
      setErrorMsg((err as Error).message);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        className="lay-in rounded-card border border-line-200 bg-card-50 px-6 py-10 text-center"
        role="status"
      >
        <p className="font-display text-[24px] text-forest-900">Bedankt voor uw bericht!</p>
        <p className="mt-2 text-muted-600">
          Ik heb uw bericht ontvangen en reageer meestal binnen een paar dagen.
        </p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => setStatus("idle")}
          type="button"
        >
          Nog een bericht sturen
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="naam" className={labelClass}>
          Naam
        </label>
        <input
          id="naam"
          name="naam"
          type="text"
          autoComplete="name"
          className={cn(inputClass, "h-12", errors.naam && errorFieldClass)}
          aria-invalid={Boolean(errors.naam)}
          aria-describedby={errors.naam ? "naam-error" : undefined}
        />
        {errors.naam && (
          <p id="naam-error" className={errorTextClass}>
            {errors.naam}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          E-mailadres
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className={cn(inputClass, "h-12", errors.email && errorFieldClass)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className={errorTextClass}>
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="bericht" className={labelClass}>
          Bericht
        </label>
        <textarea
          id="bericht"
          name="bericht"
          rows={5}
          className={cn(inputClass, "min-h-[120px] resize-y py-3", errors.bericht && errorFieldClass)}
          aria-invalid={Boolean(errors.bericht)}
          aria-describedby={errors.bericht ? "bericht-error" : undefined}
        />
        {errors.bericht && (
          <p id="bericht-error" className={errorTextClass}>
            {errors.bericht}
          </p>
        )}
      </div>

      {/* Honeypot — hidden from humans; bots that fill it are silently dropped. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden" tabIndex={-1}>
        <label htmlFor="website">Laat dit veld leeg</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status === "error" && (
        <p role="alert" className="text-[14px] text-red-700">
          {errorMsg}
        </p>
      )}

      <Button type="submit" disabled={status === "submitting"} className="disabled:opacity-60">
        {status === "submitting" ? "Versturen…" : "Verzenden"}
      </Button>
    </form>
  );
}
