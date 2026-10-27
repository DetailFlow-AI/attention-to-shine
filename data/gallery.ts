// Every photo in the gallery, in the order it appears on the page.
//
// ── HOW TO CHANGE THESE ───────────────────────────────────────────────────────
// Add a photo:    drop the file into  public/images/gallery/  then copy a
//                 { ... } block below and point `file` at your filename.
// Remove a photo: delete its { ... } block.
// Reorder:        move the blocks around.
//
// `caption` is the short line printed under the photo.
// `alt` is the longer description Google reads and a screen reader speaks.
// Keep both true: what was done, to what vehicle, where.

export interface GalleryPhoto {
  /** File name inside public/images/gallery/ */
  file: string;
  /** Short line under the photo, e.g. "Range Rover — Interior". */
  caption: string;
  /** For Google and screen readers, e.g. "Full interior detail on a black SUV in Lakeland". */
  alt: string;
}

/** Where the gallery photos live, under /public. */
export const GALLERY_DIR = "/images/gallery";

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    file: "bmw-m60-exterior.jpg",
    caption: "BMW M60 — Exterior",
    alt: "Exterior detail on a BMW M60 in Lakeland, Florida",
  },
  {
    file: "bmw-x1-exterior.jpg",
    caption: "BMW X1 — Exterior",
    alt: "Exterior detail on a BMW X1 in Lakeland, Florida",
  },
  {
    file: "bmw-x1-interior-rear.jpg",
    caption: "BMW X1 — Rear seats",
    alt: "Interior detail on the rear seats of a BMW X1",
  },
  {
    file: "buick-encore-exterior.jpg",
    caption: "Buick Encore — Exterior",
    alt: "Exterior detail on a Buick Encore in Lakeland, Florida",
  },
  {
    file: "chevrolet-camaro-exterior.jpg",
    caption: "Chevrolet Camaro — Exterior",
    alt: "Exterior detail on a Chevrolet Camaro in Lakeland, Florida",
  },
  {
    file: "dodge-challenger-exterior.jpg",
    caption: "Dodge Challenger — Exterior",
    alt: "Exterior detail on a Dodge Challenger in Lakeland, Florida",
  },
  {
    file: "dodge-charger-daytona-exterior.jpg",
    caption: "Dodge Charger Daytona — Exterior",
    alt: "Exterior detail on a Dodge Charger Daytona in Lakeland, Florida",
  },
  {
    file: "ford-f150-exterior.jpg",
    caption: "Ford F-150 — Exterior",
    alt: "Exterior detail on a Ford F-150 in Lakeland, Florida",
  },
  {
    file: "ford-raptor-exterior.jpg",
    caption: "Ford Raptor — Exterior",
    alt: "Exterior detail on a Ford Raptor in Lakeland, Florida",
  },
  {
    file: "gmc-sierra-exterior.jpg",
    caption: "GMC Sierra — Exterior",
    alt: "Exterior detail on a GMC Sierra in Lakeland, Florida",
  },
  {
    file: "land-rover-defender-exterior.jpg",
    caption: "Land Rover Defender — Exterior",
    alt: "Exterior detail on a Land Rover Defender in Lakeland, Florida",
  },
  {
    file: "land-rover-defender-interior.jpg",
    caption: "Land Rover Defender — Interior",
    alt: "Interior detail inside a Land Rover Defender",
  },
  {
    file: "lincoln-navigator-cargo.jpg",
    caption: "Lincoln Navigator — Cargo area",
    alt: "Interior detail in the cargo area of a Lincoln Navigator",
  },
  {
    file: "lincoln-navigator-exterior.jpg",
    caption: "Lincoln Navigator — Exterior",
    alt: "Exterior detail on a Lincoln Navigator in Lakeland, Florida",
  },
  {
    file: "range-rover-exterior-black.jpg",
    caption: "Range Rover — Exterior",
    alt: "Exterior detail on a black Range Rover in Lakeland, Florida",
  },
  {
    file: "range-rover-exterior-white.jpg",
    caption: "Range Rover — Exterior",
    alt: "Exterior detail on a white Range Rover in Lakeland, Florida",
  },
  {
    file: "range-rover-interior-cream.jpg",
    caption: "Range Rover — Interior",
    alt: "Interior detail on the cream leather seats of a Range Rover",
  },
  {
    file: "range-rover-interior-tan.jpg",
    caption: "Range Rover — Interior",
    alt: "Interior detail on the tan leather seats of a Range Rover",
  },
];
