import { MapPin } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { getContent, getSettings, text } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/contact/ContactForm";
import { SocialLinks } from "@/components/contact/SocialLinks";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Neem contact op met Josette Spapens voor een portret in opdracht of een vraag. Realistische portrettekeningen vanuit Hilvarenbeek, Nederland.",
  path: "/contact",
});

export default async function ContactPage() {
  const [content, settings] = await Promise.all([getContent(), getSettings()]);

  return (
    <section className="screen-section bg-paper-50">
      <Container className="grid gap-12 py-10 md:grid-cols-2 md:gap-[60px]">
        {/* Form */}
        <div>
          <h1 className="text-h2 text-ink-900">{text(content, "contact.title")}</h1>
          <p className="mt-3 max-w-md text-muted-600">{text(content, "contact.subtitle")}</p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>

        {/* Info */}
        <div className="flex h-full flex-col">
          {settings.mapEmbedUrl ? (
            <iframe
              src={settings.mapEmbedUrl}
              title={`Kaart — ${settings.locality}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="min-h-[280px] w-full flex-1 rounded-card border border-line-200"
            />
          ) : (
            <div className="flex min-h-[280px] w-full flex-1 items-center justify-center rounded-card border border-line-200 bg-paper-100">
              <MapPin className="text-forest-900" size={40} />
            </div>
          )}

          <h2 className="mt-8 text-h3 text-ink-900">
            {text(content, "contact.location_title")}
          </h2>
          <div className="mt-3 space-y-1 text-muted-600">
            <p>Realistische portrettekeningen</p>
            <p>
              {settings.locality} · {settings.countryName}
            </p>
            <p>
              Mail:{" "}
              <a
                href={`mailto:${settings.email}`}
                className="font-semibold text-forest-600 hover:underline"
              >
                {settings.email}
              </a>
            </p>
          </div>

          <div className="mt-6">
            <SocialLinks facebook={settings.facebook} instagram={settings.instagram} />
          </div>
        </div>
      </Container>
    </section>
  );
}
