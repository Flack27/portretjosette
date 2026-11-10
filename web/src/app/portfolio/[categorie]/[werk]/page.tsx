import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getCategory,
  getPortrait,
  getPortraitWithNeighbours,
  getPortraits,
} from "@/lib/content";
import { pageMetadata, breadcrumbJsonLd, artworkJsonLd } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { JsonLd } from "@/components/seo/JsonLd";

type Params = { params: Promise<{ categorie: string; werk: string }> };

export async function generateStaticParams() {
  const works = await getPortraits();
  return works.map((p) => ({ categorie: p.category, werk: p.slug }));
}

/** One sentence describing the work, reused for the meta description and the page. */
function describe(title: string, medium: string, categoryName: string) {
  return `${title} — realistische portrettekening in ${medium.toLowerCase()} door Josette Spapens, uit de categorie ${categoryName.toLowerCase()}.`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { categorie, werk } = await params;
  const [work, category] = await Promise.all([
    getPortrait(categorie, werk),
    getCategory(categorie),
  ]);
  if (!work || !category) return {};

  const meta = pageMetadata({
    title: work.title,
    description: describe(work.title, work.medium, category.name),
    path: `/portfolio/${categorie}/${werk}`,
  });

  // The drawing is a far better share card than the site-wide image.
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      images: [{ url: work.image, alt: work.alt }],
    },
    twitter: { ...meta.twitter, images: [work.image] },
  };
}

export default async function WorkPage({ params }: Params) {
  const { categorie, werk } = await params;
  const [found, category] = await Promise.all([
    getPortraitWithNeighbours(categorie, werk),
    getCategory(categorie),
  ]);
  if (!found || !category) notFound();

  const { work, position, total, previous, next } = found;
  const description = describe(work.title, work.medium, category.name);
  const hasNeighbours = total > 1;

  return (
    <section className="screen-min bg-paper-50">
      <Container className="py-10 md:py-14">
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Portfolio", path: "/portfolio" },
            { name: category.name, path: `/portfolio/${category.slug}` },
            { name: work.title, path: `/portfolio/${category.slug}/${work.slug}` },
          ])}
        />
        <JsonLd
          data={artworkJsonLd({
            title: work.title,
            description,
            image: work.image,
            medium: work.medium,
            path: `/portfolio/${category.slug}/${work.slug}`,
          })}
        />

        {/* Breadcrumb */}
        <nav
          className="lay-in flex flex-wrap items-center gap-x-2 gap-y-1"
          aria-label="Kruimelpad"
        >
          <Link
            href="/portfolio"
            className="focus-ring text-[13px] text-muted-500 transition-colors hover:text-forest-600"
          >
            Portfolio
          </Link>
          <span className="text-[13px] text-faint-300" aria-hidden>
            /
          </span>
          <Link
            href={`/portfolio/${category.slug}`}
            className="focus-ring text-[13px] text-muted-500 transition-colors hover:text-forest-600"
          >
            {category.name}
          </Link>
          <span className="text-[13px] text-faint-300" aria-hidden>
            /
          </span>
          <span className="text-[13px] text-muted-400">{work.title}</span>
        </nav>

        <div className="mt-6 grid items-start gap-10 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:gap-14">
          {/* The drawing, as large as the column allows. */}
          <figure className="lay-in [--lay-rise:24px]">
            <div className="image-slot relative overflow-hidden rounded-crisp shadow-frame">
              <Image
                src={work.image}
                alt={work.alt}
                width={1400}
                height={1750}
                priority
                sizes="(min-width: 768px) 58vw, 92vw"
                className="h-auto w-full object-contain"
              />
            </div>
            <figcaption className="mt-3 text-[13px] text-muted-500">
              {work.medium} · {category.name}
            </figcaption>
          </figure>

          <div>
            <h1 className="lay-in text-h2 text-ink-900 [--lay-delay:55ms]">
              {work.title}
            </h1>

            <dl className="lay-in mt-5 space-y-3 border-t border-line-300 pt-5 text-[15px] [--lay-delay:95ms]">
              <div className="flex gap-3">
                <dt className="w-24 shrink-0 text-muted-400">Techniek</dt>
                <dd className="text-ink-700">{work.medium}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-24 shrink-0 text-muted-400">Categorie</dt>
                <dd className="text-ink-700">
                  <TextLink href={`/portfolio/${category.slug}`} arrow={false}>
                    {category.name}
                  </TextLink>
                </dd>
              </div>
              {hasNeighbours && (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-muted-400">In reeks</dt>
                  <dd className="tabular-nums text-ink-700">
                    {position} van {total}
                  </dd>
                </div>
              )}
            </dl>

            <div className="lay-in mt-8 rounded-card bg-forest-900 px-[26px] py-6 [--lay-delay:140ms]">
              <h2 className="font-display text-[21px] text-on-forest-heading">
                Ook zo&apos;n portret?
              </h2>
              <p className="mt-2 text-[13.5px] text-on-forest-body">
                Stuur een foto en ik teken hem na, met oog voor de juiste blik en
                emotie.
              </p>
              <Button href="/contact" variant="primaryInverse" className="mt-5">
                Portret aanvragen
              </Button>
            </div>
          </div>
        </div>

        {/* Walk the category without going back to the grid. */}
        {hasNeighbours && (
          <nav
            className="mt-12 flex items-center justify-between gap-4 border-t border-line-300 pt-6"
            aria-label="Meer werk in deze categorie"
          >
            <Link
              href={`/portfolio/${category.slug}/${previous.slug}`}
              rel="prev"
              className="group focus-ring flex min-w-0 items-center gap-2 text-muted-600 transition-colors hover:text-forest-600"
            >
              <ChevronLeft
                size={20}
                strokeWidth={1.75}
                className="shrink-0 transition-transform duration-200 ease-settle group-hover:-translate-x-0.5"
              />
              <span className="truncate text-[14px]">{previous.title}</span>
            </Link>
            <Link
              href={`/portfolio/${category.slug}/${next.slug}`}
              rel="next"
              className="group focus-ring flex min-w-0 items-center gap-2 text-right text-muted-600 transition-colors hover:text-forest-600"
            >
              <span className="truncate text-[14px]">{next.title}</span>
              <ChevronRight
                size={20}
                strokeWidth={1.75}
                className="shrink-0 transition-transform duration-200 ease-settle group-hover:translate-x-0.5"
              />
            </Link>
          </nav>
        )}
      </Container>
    </section>
  );
}

/*
  Left on (the default) deliberately. `generateStaticParams` runs during
  `next build`, and inside the Docker build the `pocketbase` hostname does not
  resolve, so it sees the seed's works rather than Josette's — turning this off
  would serve exactly 404 for every real drawing. On-demand rendering means a
  slug that was not in the build set is rendered on first request, where
  PocketBase is reachable, and cached from then on. A slug that belongs to no
  work still 404s, via notFound() above.
*/
export const dynamicParams = true;
