import type { SVGProps } from "react";

/* lucide-react no longer ships brand logos, so the two glyphs are inline. */

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      aria-hidden
      {...props}
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Round social buttons; renders nothing until a URL is configured in settings. */
export function SocialLinks({
  facebook,
  instagram,
}: {
  facebook: string;
  instagram: string;
}) {
  const items = [
    facebook ? { href: facebook, label: "Facebook", Icon: FacebookIcon } : null,
    instagram ? { href: instagram, label: "Instagram", Icon: InstagramIcon } : null,
  ].filter((x): x is { href: string; label: string; Icon: typeof FacebookIcon } => x !== null);

  if (items.length === 0) return null;

  return (
    <div className="flex gap-3">
      {items.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-forest-900 text-white transition-colors hover:bg-forest-600"
        >
          <Icon width={19} height={19} />
        </a>
      ))}
    </div>
  );
}
