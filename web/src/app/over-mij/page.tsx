import { pageMetadata } from "@/lib/seo";
import { getContent, getSettings, text } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FramedImage } from "@/components/ui/FramedImage";

export const metadata = pageMetadata({
  title: "Over mij",
  description:
    "Hoe het begon — Josette Spapens over haar achtergrond als biologiedocent en haar realistische portretten in pastelkrijt, grafiet en houtskool.",
  path: "/over-mij",
});

export default async function OverMijPage() {
  const [content, settings] = await Promise.all([getContent(), getSettings()]);

  const stats = [
    { num: text(content, "over.stat1_num"), label: text(content, "over.stat1_label") },
    { num: text(content, "over.stat2_num"), label: text(content, "over.stat2_label") },
    { num: text(content, "over.stat3_num"), label: text(content, "over.stat3_label") },
  ];

  return (
    <section className="screen-section bg-paper-50">
      <Container className="grid items-center gap-10 py-10 md:grid-cols-2 md:gap-16">
        <FramedImage
          src={settings.overMijImage}
          alt="Zelfportret van Josette Spapens in pastelkrijt"
          ratio={0.82}
          frameOffset={16}
          sizes="(min-width: 768px) 42vw, 88vw"
          className="lay-in mx-auto w-full max-w-sm [--lay-rise:24px] md:mx-4"
        />

        <div>
          <Eyebrow className="lay-in [--lay-delay:55ms]">
            {text(content, "over.eyebrow")}
          </Eyebrow>
          <h1 className="lay-in mt-3 text-h2 text-ink-900 [--lay-delay:95ms]">
            {text(content, "over.title")}
          </h1>

          <div className="lay-in mt-5 space-y-4 text-muted-600 [--lay-delay:140ms]">
            <p>{text(content, "over.p1")}</p>
            <p>{text(content, "over.p2")}</p>
            <p>{text(content, "over.p3")}</p>
          </div>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4 border-t border-line-300 pt-6">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="lay-reveal"
                style={{ "--lay-i": i } as React.CSSProperties}
              >
                <dt className="font-display text-[34px] leading-none text-forest-900">
                  {s.num}
                </dt>
                <dd className="mt-1 text-[13px] text-muted-400">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
