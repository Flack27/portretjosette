import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCategories,
  getCategory,
  getPortraitsByCategory,
} from "@/lib/content";
import { pageMetadata, breadcrumbJsonLd, galleryJsonLd } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Gallery } from "@/components/portfolio/Gallery";
import { JsonLd } from "@/components/seo/JsonLd";

type Params = { params: Promise<{ categorie: string }> };

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ categorie: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { categorie } = await params;
  const category = await getCategory(categorie);
  if (!category) return {};
  return pageMetadata({
    title: category.name,
    description: `${category.name} — ${category.blurb} Realistische portrettekeningen door Josette Spapens.`,
    path: `/portfolio/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: Params) {
  const { categorie } = await params;
  const category = await getCategory(categorie);
  if (!category) notFound();

  const portraits = await getPortraitsByCategory(category.slug);

  return (
    <section className="screen-min bg-paper-50">
      <Container className="py-10 md:py-14">
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Portfolio", path: "/portfolio" },
            { name: category.name, path: `/portfolio/${category.slug}` },
          ])}
        />
        <JsonLd
          data={galleryJsonLd({
            name: `${category.name} — Portret door Josette`,
            description: category.blurb,
            path: `/portfolio/${category.slug}`,
            images: portraits.map((p) => p.image),
          })}
        />

        {/* Breadcrumb + heading (category name is the page h1) */}
        <div className="lay-in flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            href="/portfolio"
            className="focus-ring text-[13px] text-muted-500 transition-colors hover:text-forest-600"
          >
            Portfolio
          </Link>
          <span className="text-[13px] text-faint-300" aria-hidden>
            /
          </span>
          <h1 className="font-display text-[22px] leading-none text-forest-900">
            {category.name}
          </h1>
        </div>

        <p className="lay-in mt-3 max-w-xl text-muted-600 [--lay-delay:55ms]">
          {category.blurb}
        </p>
        <p className="lay-in mt-1 text-[13px] text-muted-400 [--lay-delay:95ms]">
          {portraits.length} {portraits.length === 1 ? "werk" : "werken"}
        </p>

        <div className="mt-8">
          <Gallery portraits={portraits} />
        </div>
      </Container>
    </section>
  );
}
