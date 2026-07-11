import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="screen-section bg-paper-50">
      <Container className="flex flex-col items-center py-12 text-center">
        <p className="eyebrow text-muted-400">404</p>
        <h1 className="mt-3 text-h1 text-ink-900">Pagina niet gevonden</h1>
        <p className="mt-3 max-w-md text-muted-600">
          Deze pagina bestaat niet (meer). Bekijk het portfolio of ga terug naar de
          startpagina.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href="/">Naar home</Button>
          <Button href="/portfolio" variant="secondary">
            Bekijk portfolio
          </Button>
        </div>
      </Container>
    </section>
  );
}
