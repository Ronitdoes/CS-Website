import { eventImages } from "./eventImages";

export const TOTAL_FRAMES = 36;

export const HERO_SEQUENCE_IMAGES: string[] = Array.from(
  { length: TOTAL_FRAMES },
  (_, i) => `/Heroimg/${(i + 1).toString().padStart(4, "0")}.avif`
);

export const CARD_STACK_IMAGES = [
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781931822598_b2n7xi.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781932593544_yg7km7.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781890098603_s975e.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781931700933_k94jd.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1783166663386_50t4ih.jpeg",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781932315150_odb4va.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781932135318_m303ra.avif",
];

export const HORIZONTAL_GALLERY_IMAGES = [
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782560566447_akr6jp.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782560022208_0qc8i9.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782561501835_is8g49.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782565661341_zbz8t.webp",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782560271203_88tlqb.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782571214276_nw4rqm.webp",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782560416402_819ju.jpeg",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782559824603_l6h16c.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782571207688_kxib06.webp",
];

export const SCROLL_GRID_IMAGES = [
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782560890144_eiggr.jpeg",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782562282146_spph3r.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782562529818_eoed.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782659857657_tzsw4o.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782562551042_2702i.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782562562411_f2i9c.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782562302512_z4c2gm.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782564214909_0h7cc2.webp",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782563020146_ic2d8u.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782564444689_w96wiw.webp",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782626827226_96d99l.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782628087084_7yu295.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782626676553_vp5eo.webp",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782659869512_du1u.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782626687798_61ilal.webp",
];

export const GALLERY_3D_DEFAULT_IMAGES: [
  string,
  string,
  string,
  string,
  string
] = [
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=760&q=85",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=760&q=85",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=760&q=85",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=760&q=85",
  "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=760&q=85",
];

export const PROJECT_IMAGES = [
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781890098603_s975e.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781890043018_ugfop6.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781890052192_ziz7r5.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1781890266264_66l66g.avif",
];

export const NAV_IMAGES = [
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782386537059_8p7ddp.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782385702000_ecd65y.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782386405527_lbiscd.avif",
  "https://pub-2b91df05320148438318902a8dc7795b.r2.dev/media/1782386135938_vj8bgs.avif",
];

export interface PreloadPlan {
  images: string[];
  assets: string[];
}

const dedupe = (urls: string[]) => Array.from(new Set(urls));

export const HOME_3D_ASSETS = ["/logos/ieee.glb", "/potsdamer_platz_1k.hdr"];

export function getPreloadPlan(pathname: string): PreloadPlan {
  if (pathname === "/") {
    return {
      images: dedupe([
        ...HERO_SEQUENCE_IMAGES,
        ...CARD_STACK_IMAGES,
        ...PROJECT_IMAGES,
        ...NAV_IMAGES,
      ]),
      assets: HOME_3D_ASSETS,
    };
  }

  if (pathname.startsWith("/gallery")) {
    return {
      images: dedupe([
        ...HORIZONTAL_GALLERY_IMAGES,
        ...SCROLL_GRID_IMAGES,
        ...GALLERY_3D_DEFAULT_IMAGES,
        ...NAV_IMAGES,
      ]),
      assets: [],
    };
  }

  if (pathname.startsWith("/events")) {
    return {
      images: dedupe([
        ...eventImages,
        ...NAV_IMAGES,
        "/logos/calendar-logo-center.avif",
      ]),
      assets: [],
    };
  }

  return { images: dedupe([...NAV_IMAGES]), assets: [] };
}
