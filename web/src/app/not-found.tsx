import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="screen-section bg-paper-50">
      <Container className="flex flex-col items-center py-12 text-center">
        <p className="lay-in eyebrow text-muted-400">404</p>
        <h1 className="lay-in mt-3 text-h1 text-ink-900 [--lay-delay:55ms]">
          Pagina niet gevonden
        </h1>
        <p className="lay-in mt-3 max-w-md text-muted-600 [--lay-delay:95ms]">
          Deze pagina bestaat niet (meer). Bekijk het portfolio of ga terug naar de
          startpagina.
        </p>
        <div className="lay-in mt-8 flex flex-wrap justify-center gap-4 [--lay-delay:165ms]">
          <Button href="/">Naar home</Button>
          <Button href="/portfolio" variant="secondary">
            Bekijk portfolio
          </Button>
        </div>
      </Container>
    </section>
  );
}
