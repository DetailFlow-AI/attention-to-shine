import Image from "next/image";

interface BeforeAfterPairProps {
  beforeSrc: string;
  afterSrc: string;
  title: string;
}

export default function BeforeAfterPair({
  beforeSrc,
  afterSrc,
  title,
}: BeforeAfterPairProps) {
  return (
    <figure>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-navy/10">
          <Image
            src={beforeSrc}
            alt={`${title} — before detailing`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
          <span className="absolute top-3 left-3 bg-navy/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
            Before
          </span>
        </div>
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-navy/10">
          <Image
            src={afterSrc}
            alt={`${title} — after detailing`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
          <span className="absolute top-3 left-3 bg-gold/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
            After
          </span>
        </div>
      </div>
      <figcaption className="text-center text-sm font-medium text-apple-text-secondary mt-4">
        {title}
      </figcaption>
    </figure>
  );
}
