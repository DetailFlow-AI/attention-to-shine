import type { ElementType } from "react";

// Text whose words light up one by one as it scrolls into view, and dim again
// on the way back up. Works in Server Components: it only renders markup; the
// shared ScrollFx observer supplies --p and CSS (.fx-words) does the rest.
//
//   <ScrollWords as="p" className="…" text="We treat every vehicle…" />
export default function ScrollWords({
  text,
  as: Tag = "p",
  className = "",
}: {
  text: string;
  as?: ElementType;
  className?: string;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag
      data-scroll="enter"
      className={`fx-words ${className}`}
      style={{ "--n": words.length } as React.CSSProperties}
    >
      {words.map((w, i) => (
        <span key={i} style={{ "--i": i } as React.CSSProperties}>
          {w}{" "}
        </span>
      ))}
    </Tag>
  );
}
