/**
 * Kawasan layanan untuk halaman SEO lokal (`/[slug]` di `lib/seo-landing.ts`).
 * Kunci = segmen URL (huruf kecil, ASCII); dipakai juga sebagai token kata kunci
 * (mis. "cold storage bali" → slug `cold-storage-bali`).
 *
 * Koordinat & kode wilayah: perkiraan pusat kota / koridor industri untuk meta geo;
 * alamat bisnis tetap dari CMS.
 */
export type IndonesiaServiceAreaCity = {
  /** Label panjang untuk judul & paragraf (boleh mencakup koridor sekitarnya). */
  displayLabel: string;
  /** Nama singkat untuk breadcrumb / placename meta. */
  placename: string;
  /** ISO 3166-2:ID */
  geoRegion: string;
  /** ICBM "lat,lng" */
  icbm: string;
};

export const INDONESIA_SERVICE_AREA_CITIES: Record<string, IndonesiaServiceAreaCity> = {
  bali: { displayLabel: "Bali", placename: "Bali", geoRegion: "ID-BA", icbm: "-8.4095,115.1889" },
  balikpapan: { displayLabel: "Balikpapan", placename: "Balikpapan", geoRegion: "ID-KI", icbm: "-1.2379,116.8529" },
  "banda-aceh": { displayLabel: "Banda Aceh & Aceh", placename: "Banda Aceh", geoRegion: "ID-AC", icbm: "5.5483,95.3238" },
  "bandar-lampung": { displayLabel: "Bandar Lampung & Lampung", placename: "Bandar Lampung", geoRegion: "ID-LA", icbm: "-5.4294,105.2625" },
  bandung: { displayLabel: "Bandung", placename: "Bandung", geoRegion: "ID-JB", icbm: "-6.9175,107.6191" },
  banjarmasin: { displayLabel: "Banjarmasin & Kalimantan Selatan", placename: "Banjarmasin", geoRegion: "ID-KS", icbm: "-3.3194,114.5908" },
  banyuwangi: { displayLabel: "Banyuwangi", placename: "Banyuwangi", geoRegion: "ID-JI", icbm: "-8.2191,114.3691" },
  batam: { displayLabel: "Batam & Kepulauan Riau", placename: "Batam", geoRegion: "ID-KR", icbm: "1.1301,104.0529" },
  bekasi: { displayLabel: "Bekasi & Cikarang", placename: "Bekasi", geoRegion: "ID-JB", icbm: "-6.2383,106.9756" },
  bengkulu: { displayLabel: "Bengkulu", placename: "Bengkulu", geoRegion: "ID-BE", icbm: "-3.8004,102.2655" },
  bitung: { displayLabel: "Bitung & Sulawesi Utara", placename: "Bitung", geoRegion: "ID-SA", icbm: "1.4406,125.1217" },
  bogor: { displayLabel: "Bogor & sentra industri Jabodetabek Selatan", placename: "Bogor", geoRegion: "ID-JB", icbm: "-6.5950,106.8166" },
  cirebon: { displayLabel: "Cirebon & Indramayu", placename: "Cirebon", geoRegion: "ID-JB", icbm: "-6.7320,108.5523" },
  denpasar: { displayLabel: "Denpasar & Bali Selatan", placename: "Denpasar", geoRegion: "ID-BA", icbm: "-8.6705,115.2126" },
  depok: { displayLabel: "Depok", placename: "Depok", geoRegion: "ID-JB", icbm: "-6.4025,106.7942" },
  gorontalo: { displayLabel: "Gorontalo", placename: "Gorontalo", geoRegion: "ID-GO", icbm: "0.5435,123.0595" },
  jambi: { displayLabel: "Jambi", placename: "Jambi", geoRegion: "ID-JA", icbm: "-1.5902,103.6103" },
  jakarta: { displayLabel: "Jakarta & Jabodetabek", placename: "Jakarta", geoRegion: "ID-JK", icbm: "-6.2088,106.8456" },
  jayapura: { displayLabel: "Jayapura & Papua", placename: "Jayapura", geoRegion: "ID-PA", icbm: "-2.5489,140.7181" },
  jember: { displayLabel: "Jember & Jember–Banyuwangi", placename: "Jember", geoRegion: "ID-JI", icbm: "-8.1724,113.7009" },
  karawang: { displayLabel: "Karawang & Purwakarta", placename: "Karawang", geoRegion: "ID-JB", icbm: "-6.3033,107.3056" },
  kendari: { displayLabel: "Kendari & Sulawesi Tenggara", placename: "Kendari", geoRegion: "ID-SG", icbm: "-3.9985,122.5129" },
  kupang: { displayLabel: "Kupang & Nusa Tenggara Timur", placename: "Kupang", geoRegion: "ID-NT", icbm: "-10.1772,123.6070" },
  makassar: { displayLabel: "Makassar & Sulawesi Selatan", placename: "Makassar", geoRegion: "ID-SN", icbm: "-5.1477,119.4327" },
  malang: { displayLabel: "Malang & Batu", placename: "Malang", geoRegion: "ID-JI", icbm: "-7.9666,112.6326" },
  manado: { displayLabel: "Manado & Minahasa", placename: "Manado", geoRegion: "ID-SA", icbm: "1.4748,124.8421" },
  mataram: { displayLabel: "Mataram & Lombok", placename: "Mataram", geoRegion: "ID-NB", icbm: "-8.5833,116.1167" },
  medan: { displayLabel: "Medan & Sumatera Utara", placename: "Medan", geoRegion: "ID-SU", icbm: "3.5952,98.6722" },
  padang: { displayLabel: "Padang & Sumatera Barat", placename: "Padang", geoRegion: "ID-SB", icbm: "-0.9471,100.4172" },
  palangkaraya: { displayLabel: "Palangka Raya & Kalimantan Tengah", placename: "Palangka Raya", geoRegion: "ID-KT", icbm: "-2.2161,113.9140" },
  palembang: { displayLabel: "Palembang & Sumatera Selatan", placename: "Palembang", geoRegion: "ID-SS", icbm: "-2.9761,104.7754" },
  palu: { displayLabel: "Palu & Sulteng", placename: "Palu", geoRegion: "ID-ST", icbm: "-0.8917,119.8707" },
  "pangkal-pinang": { displayLabel: "Pangkal Pinang & Bangka Belitung", placename: "Pangkal Pinang", geoRegion: "ID-BB", icbm: "-2.1316,106.1169" },
  pekalongan: { displayLabel: "Pekalongan & Pantura Jawa Tengah", placename: "Pekalongan", geoRegion: "ID-JT", icbm: "-6.8883,109.6753" },
  pekanbaru: { displayLabel: "Pekanbaru & Riau", placename: "Pekanbaru", geoRegion: "ID-RI", icbm: "0.5071,101.4478" },
  pontianak: { displayLabel: "Pontianak & Kalimantan Barat", placename: "Pontianak", geoRegion: "ID-KB", icbm: "-0.0263,109.3425" },
  purwokerto: { displayLabel: "Purwokerto & Banyumas", placename: "Purwokerto", geoRegion: "ID-JT", icbm: "-7.4211,109.2344" },
  samarinda: { displayLabel: "Samarinda & Kaltim", placename: "Samarinda", geoRegion: "ID-KI", icbm: "-0.5021,117.1536" },
  semarang: { displayLabel: "Semarang & Kendal", placename: "Semarang", geoRegion: "ID-JT", icbm: "-6.9667,110.4167" },
  serang: { displayLabel: "Serang & Banten", placename: "Serang", geoRegion: "ID-BT", icbm: "-6.1200,106.1503" },
  sidoarjo: { displayLabel: "Sidoarjo & Gerbangkertosusila", placename: "Sidoarjo", geoRegion: "ID-JI", icbm: "-7.4475,112.7188" },
  sorong: { displayLabel: "Sorong & Papua Barat", placename: "Sorong", geoRegion: "ID-PB", icbm: "-0.8657,131.2514" },
  surabaya: { displayLabel: "Surabaya", placename: "Surabaya", geoRegion: "ID-JI", icbm: "-7.2575,112.7521" },
  surakarta: { displayLabel: "Solo & Surakarta", placename: "Surakarta", geoRegion: "ID-JT", icbm: "-7.5755,110.8243" },
  tasikmalaya: { displayLabel: "Tasikmalaya & Priangan Timur", placename: "Tasikmalaya", geoRegion: "ID-JB", icbm: "-7.3274,108.2207" },
  tarakan: { displayLabel: "Tarakan & Kaltara", placename: "Tarakan", geoRegion: "ID-KU", icbm: "3.3263,117.5905" },
  tangerang: { displayLabel: "Tangerang & BSD", placename: "Tangerang", geoRegion: "ID-BT", icbm: "-6.1781,106.6319" },
  tegal: { displayLabel: "Tegal & Brebes", placename: "Tegal", geoRegion: "ID-JT", icbm: "-6.8797,109.1404" },
  yogyakarta: { displayLabel: "Yogyakarta & sekitarnya", placename: "Yogyakarta", geoRegion: "ID-YO", icbm: "-7.7956,110.3695" },
};

/** Kunci kota untuk generator halaman SEO & geo (urutan stabil). */
export const INDONESIA_SERVICE_AREA_CITY_KEYS: string[] = Object.keys(INDONESIA_SERVICE_AREA_CITIES).sort((a, b) =>
  a.localeCompare(b, "id"),
);

/** `slug` → `displayLabel` untuk `lib/seo-landing.ts`. */
export function indonesiaServiceAreaDisplayLabelsByKey(): Record<string, string> {
  return Object.fromEntries(
    INDONESIA_SERVICE_AREA_CITY_KEYS.map((k) => [k, INDONESIA_SERVICE_AREA_CITIES[k]!.displayLabel]),
  );
}
