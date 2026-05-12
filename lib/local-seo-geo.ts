/**
 * Koordinat & kode wilayah perkiraan untuk geo metadata / schema area layanan.
 * Alamat bisnis tetap dari CMS (`kontak`); ini memperkuat relevansi lokal per kota.
 */
export const CITY_LOCAL_GEO: Record<
  string,
  { geoRegion: string; placename: string; icbm: string }
> = {
  jakarta: { geoRegion: "ID-JK", placename: "Jakarta", icbm: "-6.2088, 106.8456" },
  bekasi: { geoRegion: "ID-JB", placename: "Bekasi", icbm: "-6.2383, 106.9756" },
  surabaya: { geoRegion: "ID-JI", placename: "Surabaya", icbm: "-7.2575, 112.7521" },
  medan: { geoRegion: "ID-SU", placename: "Medan", icbm: "3.5952, 98.6722" },
  bandung: { geoRegion: "ID-JB", placename: "Bandung", icbm: "-6.9175, 107.6191" },
  semarang: { geoRegion: "ID-JT", placename: "Semarang", icbm: "-6.9667, 110.4167" },
  tangerang: { geoRegion: "ID-BT", placename: "Tangerang", icbm: "-6.1781, 106.6319" },
  makassar: { geoRegion: "ID-SN", placename: "Makassar", icbm: "-5.1477, 119.4327" },
  bali: { geoRegion: "ID-BA", placename: "Bali", icbm: "-8.4095, 115.1889" },
};

/** Kunci kota yang dipakai halaman area layanan & geo (sinkron dengan `CITIES` di seo-landing). */
export const SERVICE_AREA_CITY_KEYS = Object.keys(CITY_LOCAL_GEO);

export function getCityPlacename(cityKey: string): string {
  return CITY_LOCAL_GEO[cityKey]?.placename ?? cityKey;
}

export function parseIcbm(icbm: string): { latitude: number; longitude: number } | null {
  const parts = icbm.split(",").map((s) => Number.parseFloat(s.trim()));
  const lat = parts[0];
  const lng = parts[1];
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { latitude: lat, longitude: lng };
}

/** Meta `geo.*` / `ICBM` untuk `<meta name="...">` (Next `metadata.other`). */
export function buildHtmlGeoMetaForCityKey(cityKey: string | undefined): Record<string, string> | undefined {
  if (!cityKey) return undefined;
  const g = CITY_LOCAL_GEO[cityKey];
  if (!g) return undefined;
  const pos = parseIcbm(g.icbm);
  const out: Record<string, string> = {
    "geo.region": g.geoRegion,
    "geo.placename": g.placename,
    ICBM: g.icbm,
  };
  if (pos) {
    out["geo.position"] = `${pos.latitude}; ${pos.longitude}`;
  }
  return out;
}
