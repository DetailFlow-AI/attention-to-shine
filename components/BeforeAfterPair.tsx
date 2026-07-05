import Image from "next/image";

interface BeforeAfterPairProps {
  before: string;
  after: string;
  title: string;
}

/**
 * Displays a matched before/after photo pair side by side —
 * before on the left, after on the right, each clearly labeled.
 */
export default function BeforeAfterPair({
  before,
  after,
  title,
}: BeforeAfterPairProps) {
  return (
    <figure className="rounded-3xl overflow-hidden shadow-xl bg-white border border-navy/10">
      <div className="grid grid-cols-2 gap-1 bg-navy/10">
        <div className="relative aspect-[4/5]">
          <Image
            src={before}
            alt={`${title} — before detailing`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
          <span className="absolute top-3 left-3 bg-navy/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
            Before
          </span>
        </div>
        <div className="relative aspect-[4/5]">
          <Image
            src={after}
            alt={`${title} — after detailing`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
          <span className="absolute top-3 right-3 bg-gold/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
            After
          </span>
        </div>
      </div>
      <figcaption className="px-5 py-4 text-sm font-semibold text-navy">
        {title}
      </figcaption>
    </figure>
  );
}
