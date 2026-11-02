import { getSettings } from "@/lib/content";
import { SITE } from "@/lib/config";
import { Wordmark } from "./Wordmark";

export async function Footer() {
  const settings = await getSettings();
  const year = new Date().getFullYear();
  const range = year > 2025 ? `2025–${year}` : "2025";

  return (
    <footer className="bg-footer">
      <div className="focus-on-dark mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-12">
        <div>
          <Wordmark size="sm" kicker={false} />
          <p className="mt-2 text-[13px] text-on-footer-body">
            {settings.locality} ·{" "}
            <a
              href={`mailto:${settings.email}`}
              className="focus-ring rounded-crisp transition-colors hover:text-on-forest-body"
            >
              {settings.email}
            </a>
          </p>
        </div>
        <p className="text-[13px] text-on-footer-muted">
          © {range} {SITE.name}
        </p>
      </div>
    </footer>
  );
}
