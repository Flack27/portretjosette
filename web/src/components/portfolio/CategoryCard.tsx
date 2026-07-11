import Image from "next/image";
import Link from "next/link";
import type { CategorySlug } from "@/lib/types";

/*
  Folder / collage card (Direction 2b). Up to five "photo prints" fan in a wide,
  gentle arc that clears the label divider. The whole card links to the category.
  The fan is built automatically from that category's own works (passed in as
  `previews`), so it always reflects the live portfolio.
*/

const SIDE = { width: 106, height: 136, border: 5, shadow: "shadow-print-soft" };
const CENTER = { width: 118, height: 150, border: 6, shadow: "shadow-print" };

const SLOT = {
  outerL: { transform: "rotate(-14deg) translateX(-120px) translateY(-2px)", zIndex: 1 },
  innerL: { transform: "rotate(-7deg) translateX(-62px) translateY(-12px)", zIndex: 2 },
  center: { transform: "translateY(-22px)", zIndex: 5 },
  innerR: { transform: "rotate(7deg) translateX(62px) translateY(-12px)", zIndex: 2 },
  outerR: { transform: "rotate(14deg) translateX(120px) translateY(-2px)", zIndex: 1 },
};

type PrintCfg = {
  image: string;
  width: number;
  height: number;
  border: number;
  shadow: string;
  transform: string;
  zIndex: number;
};

/** Assign up to 5 images to symmetric fan slots (first image = most prominent). */
function fanLayout(previews: string[]): PrintCfg[] {
  const side = (img: string) => ({ image: img, ...SIDE });
  const ctr = (img: string) => ({ image: img, ...CENTER });
  const p = previews;
  switch (Math.min(p.length, 5)) {
    case 5:
      return [
        { ...side(p[3]), ...SLOT.outerL },
        { ...side(p[1]), ...SLOT.innerL },
        { ...ctr(p[0]), ...SLOT.center },
        { ...side(p[2]), ...SLOT.innerR },
        { ...side(p[4]), ...SLOT.outerR },
      ];
    case 4:
      return [
        { ...side(p[2]), ...SLOT.outerL },
        { ...side(p[0]), ...SLOT.innerL },
        { ...side(p[1]), ...SLOT.innerR },
        { ...side(p[3]), ...SLOT.outerR },
      ];
    case 3:
      return [
        { ...side(p[1]), ...SLOT.innerL },
        { ...ctr(p[0]), ...SLOT.center },
        { ...side(p[2]), ...SLOT.innerR },
      ];
    case 2:
      return [
        { ...side(p[0]), ...SLOT.innerL },
        { ...side(p[1]), ...SLOT.innerR },
      ];
    case 1:
      return [{ ...ctr(p[0]), ...SLOT.center }];
    default:
      return [];
  }
}

function Print({ image, width, height, border, shadow, transform, zIndex }: PrintCfg) {
  return (
    <div
      className={`absolute overflow-hidden rounded-crisp bg-white ${shadow}`}
      style={{
        width,
        height,
        borderWidth: border,
        borderStyle: "solid",
        borderColor: "#fff",
        transform,
        zIndex,
      }}
    >
      <Image
        src={image}
        alt=""
        fill
        sizes="130px"
        className="object-cover"
        style={{ objectPosition: "50% 30%" }}
      />
    </div>
  );
}

export function CategoryCard({
  slug,
  name,
  count,
  previews,
}: {
  slug: CategorySlug;
  name: string;
  count: number;
  previews: string[];
}) {
  const prints = fanLayout(previews);

  return (
    <Link
      href={`/portfolio/${slug}`}
      className="group block rounded-folder border border-line-200 bg-card-50 px-5 pt-6 pb-[18px] shadow-[0_2px_0_#ece7d9] transition-transform duration-300 hover:-translate-y-1"
    >
      {/* Fan stage */}
      <div className="relative h-[168px] md:h-[196px]">
        <div className="absolute inset-0 flex origin-center scale-[0.8] items-center justify-center transition-transform duration-500 md:scale-100 md:group-hover:scale-[1.03]">
          {prints.map((cfg, i) => (
            <Print key={i} {...cfg} />
          ))}
        </div>
      </div>

      {/* Label row */}
      <div className="mt-3 flex items-baseline justify-between border-t border-line-300 pt-3">
        <span className="font-display text-[21px] leading-none text-forest-900 md:text-[25px]">
          {name}
        </span>
        <span className="text-[12.5px] font-semibold text-muted-400">
          {count} {count === 1 ? "werk" : "werken"} →
        </span>
      </div>
    </Link>
  );
}
