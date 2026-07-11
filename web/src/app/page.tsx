import Image from "next/image";
import { pageMetadata } from "@/lib/seo";
import { getContent, getFeaturedPortraits, getSettings, text } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { FramedImage } from "@/components/ui/FramedImage";
import Link from "next/link";

export const metadata = pageMetadata({ path: "/" });

export default async function HomePage() {
  const [content, featured, settings] = await Promise.all([
    getContent(),
    getFeaturedPortraits(4),
    getSettings(),
  ]);

  return (
    <>
      {/* Hero — Direction 1b "Atelier" */}
      <section className="screen-section bg-paper-50">
        <Container className="grid items-center gap-12 py-10 md:grid-cols-2 md:gap-[60px]">
          <div className="max-w-xl">
            <Eyebrow>{text(content, "home.hero_eyebrow")}</Eyebrow>
            <h1 className="mt-5 text-display text-ink-900">
              {text(content, "home.hero_title_lead")}{" "}
              <span className="italic text-forest-600">
                {text(content, "home.hero_title_accent")}
              </span>
            </h1>
            <p className="mt-6 max-w-[420px] text-lead text-muted-600">
              {text(content, "home.hero_lead")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Button href="/contact">{text(content, "home.hero_cta")}</Button>
              <TextLink href="/portfolio">Bekijk het portfolio</TextLink>
            </div>
          </div>

          <FramedImage
            src={settings.heroImage}
            alt="Realistisch pastelportret van Josette Spapens"
            ratio={0.83}
            frameOffset={14}
            priority
            sizes="(min-width: 768px) 42vw, 88vw"
            className="mx-auto w-full max-w-sm md:ml-auto md:mr-4"
          />
        </Container>
      </section>

      {/* "Een greep uit het werk" */}
      <section className="bg-paper-100">
        <Container className="py-12 md:py-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-[26px] leading-tight md:text-[30px]">
              {text(content, "home.featured_title")}
            </h2>
            <TextLink href="/portfolio">Alles bekijken</TextLink>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {featured.map((p) => (
              <Link
                key={p.id}
                href={`/portfolio/${p.category}`}
                className="group relative block aspect-square overflow-hidden rounded-crisp shadow-print-soft"
              >
                <Image
                  src={p.image}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 768px) 22vw, 45vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
