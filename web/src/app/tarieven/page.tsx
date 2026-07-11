import { pageMetadata } from "@/lib/seo";
import { getContent, getPricesByGroup, text } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { PriceCard } from "@/components/tarieven/PriceCard";

export const metadata = pageMetadata({
  title: "Tarieven",
  description:
    "Tarieven voor realistische portrettekeningen in opdracht: A4 en A3 portretten van persoon of dier, duo en trio, plus klein werk en afwerking met fotolijst.",
  path: "/tarieven",
});

export default async function TarievenPage() {
  const [content, portretten, kleinWerk, afwerking] = await Promise.all([
    getContent(),
    getPricesByGroup("Portretten"),
    getPricesByGroup("Klein werk"),
    getPricesByGroup("Afwerking"),
  ]);

  return (
    <section className="screen-section bg-paper-50">
      <Container className="py-10">
        <div className="max-w-[620px]">
          <h1 className="text-h2 text-ink-900">{text(content, "tarieven.title")}</h1>
          <p className="mt-3 text-muted-600">{text(content, "tarieven.intro")}</p>
        </div>

        <div className="mt-8 grid items-start gap-6 md:grid-cols-2">
          {/* Left column — the prices */}
          <div className="flex flex-col gap-6">
            <PriceCard
              title="Portretten"
              tag="Excl. lijst"
              headerClassName="bg-forest-900"
              rows={portretten}
            />
            <PriceCard
              title="Klein werk"
              tag="Incl. lijst"
              headerClassName="bg-forest-600"
              rows={kleinWerk}
            />
            <div className="rounded-card border border-[#e2dccc] bg-paper-100 px-[26px] py-[22px]">
              <Eyebrow>{text(content, "tarieven.afwerking_title")}</Eyebrow>
              <div className="mt-4 flex flex-wrap gap-9">
                {afwerking.map((row) => (
                  <div key={row.id}>
                    <p className="font-display text-[26px] leading-none text-forest-900">
                      {row.price}
                    </p>
                    <p className="mt-1 text-[13px] text-muted-500">{row.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — CTA + "Werken met foto's" */}
          <div className="flex flex-col gap-6">
            <div className="rounded-card bg-forest-900 px-[26px] py-6 text-[#e9ecdf]">
              <h2 className="font-display text-[21px] text-on-forest-heading">
                {text(content, "tarieven.cta_title")}
              </h2>
              <p className="mt-2 text-[13.5px] text-on-forest-body">
                {text(content, "tarieven.cta_body")}
              </p>
              <Button href="/contact" variant="primaryInverse" className="mt-5">
                {text(content, "tarieven.cta_button")}
              </Button>
            </div>

            <div>
              <h2 className="font-display text-[1.5rem] leading-tight text-ink-900">
                {text(content, "tarieven.werkwijze_title")}
              </h2>
              <div className="mt-4 space-y-4 text-[1rem] leading-[1.8] text-muted-600">
                <p>{text(content, "tarieven.werkwijze_p1")}</p>
                <p>{text(content, "tarieven.werkwijze_p2")}</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
