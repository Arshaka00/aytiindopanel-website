# CMS folder (SEO & konten tambahan)

Semua konten utama situs dapat tetap diatur lewat dashboard CMS (`live.json`). Folder ini menjadi **titik tambahan** untuk mengelola asset SEO secara berkas—tanpa membuat route Next baru.

```
content/cms/
├── services/   ← manifest / kutipan (opsional — lihat README di folder)
├── cities/     ← overlay per halaman kota: `{slug}.json`
└── articles/   ← satu artikel per berkas `{slug}.json` (merge ke data/seo-articles)
```

## `cities/[slug-page].json`

Contoh nama file: `cold-storage-bandung.json` (slug URL penuh).

Field opsional:

- `metaTitle`, `metaDescription`, `keywords[]`
- `h1`, `heroSubheadline`, `heroLead`, `introParagraph`
- `coverageAreas[]`
- `relatedGalleryProjectIds[]` — **`id`** entri dari **Portfolio CMS** (`content.portfolio.projects`, sama seperti beranda)

## `articles/[slug].json`

Partial merge: jika `slug` sudah ada di `data/seo-articles/live.json`, field di file ini mengisi/override hal yang sama.

Artikel baru: file minimal harus menyertakan `title` dan `bodyMarkdown` (Markdown). Field lain boleh ditambahkan mengikuti tipe di `lib/seo-articles/types.ts`.

Set `published: true` agar muncul di `generateStaticParams` dan sitemap.

## `services/`

Untuk struktur masa depan / dokumen kutipan. Halaman layanan tetap menggunakan `data/layanan-pages/live.json` dan manifest `lib/service-pages.ts` sampai migasi penuh (jaga kompatibilitas).
