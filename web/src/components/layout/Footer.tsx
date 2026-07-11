import { getSettings } from "@/lib/content";
import { SITE } from "@/lib/config";
import { Wordmark } from "./Wordmark";

export async function Footer() {
  const settings = await getSettings();
  const year = new Date().getFullYear();
  const range = year > 2025 ? `2025–${year}` : "2025";

  return (
    <footer className="bg-footer">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-12">
        <div>
          <Wordmark size="sm" kicker={false} />
          <p className="mt-2 text-[12.5px] text-[#8f8b7c]">
            {settings.locality} ·{" "}
            <a href={`mailto:${settings.email}`} className="hover:text-[#c3ccae]">
              {settings.email}
            </a>
          </p>
        </div>
        <p className="text-[12px] text-[#6f6c5f]">
          © {range} {SITE.name}
        </p>
      </div>
    </footer>
  );
}
