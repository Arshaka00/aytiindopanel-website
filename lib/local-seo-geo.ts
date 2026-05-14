/**
 * Koordinat & kode wilayah perkiraan untuk geo metadata / schema area layanan.
 * Alamat bisnis tetap dari CMS (`kontak`); ini memperkuat relevansi lokal per kota.
 *
 * Sumber kunci kota: `lib/indonesia-service-area-cities.ts` (sinkron dengan `CITIES` di `seo-landing`).
 */
import { INDONESIA_SERVICE_AREA_CITIES, INDONESIA_SERVICE_AREA_CITY_KEYS } from "@/lib/indonesia-service-area-cities";

export const CITY_LOCAL_GEO: Record<string, { geoRegion: string; placename: string; icbm: string }> =
  Object.fromEntries(
    INDONESIA_SERVICE_AREA_CITY_KEYS.map((k) => {
      const c = INDONESIA_SERVICE_AREA_CITIES[k]!;
      return [k, { geoRegion: c.geoRegion, placename: c.placename, icbm: c.icbm }];
    }),
  );

/** Kunci kota yang dipakai halaman area layanan & geo (sinkron dengan `CITIES` di seo-landing). */
export const SERVICE_AREA_CITY_KEYS = INDONESIA_SERVICE_AREA_CITY_KEYS;

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
