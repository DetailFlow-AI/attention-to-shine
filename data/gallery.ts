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
  {
    file: "lincoln-mkz-exterior.jpg",
    caption: "Lincoln MKZ — Exterior",
    alt: "Exterior detail on a white Lincoln MKZ in Lakeland, Florida",
  },
  {
    file: "lincoln-mkz-interior.jpg",
    caption: "Lincoln MKZ — Interior",
    alt: "Interior detail on the cream leather front seats of a Lincoln MKZ",
  },
  {
    file: "ford-explorer-exterior-maroon.jpg",
    caption: "Ford Explorer — Exterior",
    alt: "Exterior detail on a maroon Ford Explorer in Lakeland, Florida",
  },
  {
    file: "saab-93-exterior.jpg",
    caption: "Saab 9-3 — Exterior",
    alt: "Exterior detail on a dark blue Saab 9-3 convertible",
  },
  {
    file: "gmc-acadia-exterior.jpg",
    caption: "GMC Acadia — Exterior",
    alt: "Exterior detail on a white GMC Acadia in Lakeland, Florida",
  },
  {
    file: "toyota-sienna-exterior.jpg",
    caption: "Toyota Sienna — Exterior",
    alt: "Exterior detail on a red Toyota Sienna minivan",
  },
  {
    file: "toyota-sienna-interior.jpg",
    caption: "Toyota Sienna — Interior",
    alt: "Interior detail on the tan front seats of a Toyota Sienna",
  },
  {
    file: "jeep-grand-cherokee-exterior.jpg",
    caption: "Jeep Grand Cherokee — Exterior",
    alt: "Exterior detail on a white Jeep Grand Cherokee in Lakeland, Florida",
  },
  {
    file: "large-suv-cargo-area.jpg",
    caption: "Large SUV — Cargo area",
    alt: "Detailed cargo area and folded rear seats in a large SUV",
  },
  {
    file: "lincoln-navigator-interior-front.jpg",
    caption: "Lincoln Navigator — Interior",
    alt: "Interior detail on the front seats and floor of a Lincoln Navigator",
  },
  {
    file: "lincoln-wheel-detail.jpg",
    caption: "Lincoln — Wheel detail",
    alt: "Cleaned and dressed wheel and tire on a Lincoln",
  },
  {
    file: "lincoln-aviator-interior.jpg",
    caption: "Lincoln Aviator — Interior",
    alt: "Interior detail on the front seats of a Lincoln Aviator",
  },
  {
    file: "lincoln-navigator-exterior-white.jpg",
    caption: "Lincoln Navigator — Exterior",
    alt: "Exterior detail on a white Lincoln Navigator in Lakeland, Florida",
  },
  {
    file: "ford-f150-exterior-black.jpg",
    caption: "Ford F-150 — Exterior",
    alt: "Exterior detail on a black Ford F-150 pickup",
  },
  {
    file: "mercedes-amg-gle-interior.jpg",
    caption: "Mercedes-AMG GLE — Interior",
    alt: "Interior detail on the front seats of a Mercedes-AMG GLE",
  },
  {
    file: "ford-expedition-exterior-twotone.jpg",
    caption: "Ford Expedition — Exterior",
    alt: "Exterior detail on a two-tone Ford Expedition in Lakeland, Florida",
  },
  {
    file: "dodge-charger-interior.jpg",
    caption: "Dodge Charger — Interior",
    alt: "Interior detail on the front seats of a Dodge Charger",
  },
  {
    file: "ford-f150-exterior-red.jpg",
    caption: "Ford F-150 — Exterior",
    alt: "Exterior detail on a red Ford F-150 pickup in Lakeland, Florida",
  },
  {
    file: "ford-f150-interior.jpg",
    caption: "Ford F-150 — Interior",
    alt: "Interior detail on the front seats of a Ford F-150",
  },
  {
    file: "toyota-tacoma-interior-gallery.jpg",
    caption: "Toyota Tacoma — Interior",
    alt: "Interior detail on the front seats and console of a Toyota Tacoma",
  },
  {
    file: "lincoln-navigator-front-seats.jpg",
    caption: "Lincoln Navigator — Front seats",
    alt: "Interior detail on the brown leather front seats of a Lincoln Navigator",
  },
  {
    file: "ford-f250-exterior.jpg",
    caption: "Ford F-250 — Exterior",
    alt: "Exterior detail on a black Ford F-250 long bed pickup",
  },
  {
    file: "ford-expedition-exterior-black.jpg",
    caption: "Ford Expedition — Exterior",
    alt: "Exterior detail on a black Ford Expedition in Lakeland, Florida",
  },
  {
    file: "ford-expedition-interior.jpg",
    caption: "Ford Expedition — Interior",
    alt: "Interior detail on the tan leather front seats of a Ford Expedition",
  },
  {
    file: "gmc-sierra-denali-exterior.jpg",
    caption: "GMC Sierra Denali — Exterior",
    alt: "Exterior detail on a white GMC Sierra Denali pickup",
  },
  {
    file: "gmc-sierra-interior.jpg",
    caption: "GMC Sierra — Interior",
    alt: "Interior detail on the front seats of a GMC Sierra",
  },
];
