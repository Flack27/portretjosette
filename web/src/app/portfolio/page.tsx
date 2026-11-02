import { pageMetadata } from "@/lib/seo";
import { getCategoriesWithCounts, getContent, text } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { CategoryCard } from "@/components/portfolio/CategoryCard";

export const metadata = pageMetadata({
  title: "Portfolio",
  description:
    "Bekijk het werk van Josette Spapens per categorie: portretten van mensen, kinderen, huisdieren en natuur — realistisch getekend in pastelkrijt.",
  path: "/portfolio",
});

export default async function PortfolioPage() {
  const [categories, content] = await Promise.all([
    getCategoriesWithCounts(),
    getContent(),
  ]);

  return (
    <section className="screen-section bg-paper-50">
      <Container className="py-10">
        <h1 className="lay-in text-h1 text-ink-900">{text(content, "portfolio.title")}</h1>
        <p className="lay-in mt-3 max-w-xl text-lead text-muted-600 [--lay-delay:55ms]">
          {text(content, "portfolio.subtitle")}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-5">
          {categories.map((c, i) => (
            <CategoryCard
              key={c.slug}
              slug={c.slug}
              name={c.name}
              count={c.count}
              previews={c.previews}
              index={i}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
