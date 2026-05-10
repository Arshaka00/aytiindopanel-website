# QA Matrix - CMS Mobile Final UAT

Scope: Final verification untuk Safari iPhone + Android Chrome, fokus CMS edit gambar, save flow, dan stabilitas interaksi.

## Environment

- Build target: production (`npm run build` lulus)
- Browser target:
  - iPhone Safari (iOS terbaru)
  - Android Chrome (versi terbaru)
- User state:
  - Admin eligible + sesi valid
  - Edit mode ON

## Test Matrix

| ID | Area | Skenario | Expected | Status |
|---|---|---|---|---|
| M-01 | CMS Chrome | Toggle `Edit mode` ON/OFF | State berpindah cepat, tidak freeze | PASS |
| M-02 | CmsImage Overlay | Tombol `Media` dan `File` muncul saat edit mode | Tombol terlihat, tap responsif | PASS |
| M-03 | Tap Target | Tap berulang pada tombol overlay gambar | Tidak ada dead area / miss tap signifikan | PASS |
| M-04 | Media Modal Open | Tap `Media` membuka modal | Modal muncul di atas semua layer | PASS |
| M-05 | Modal Close (Button) | Tap tombol `Tutup` | Modal tertutup mulus | PASS |
| M-06 | Modal Close (Backdrop) | Tap area gelap backdrop | Modal tertutup | PASS |
| M-07 | Modal Close (Esc) | Tekan Escape (keyboard device) | Modal tertutup | PASS |
| M-08 | Scroll Lock | Saat modal terbuka, scroll body utama | Background tidak ikut scroll | PASS |
| M-09 | Search Media | Isi kolom pencarian | Grid terfilter sesuai keyword | PASS |
| M-10 | Empty State | Search tanpa hasil | Pesan no-result tampil jelas | PASS |
| M-11 | Upload Progress | Upload file via tombol `Unggah` | Progress bar tampil sampai selesai | PASS |
| M-12 | Drag/Drop | Drag/drop file ke dropzone | Upload diproses normal | PASS |
| M-13 | Assign Existing | Tap item media saat mode assign | URL terpasang ke field + modal tutup | PASS |
| M-14 | Upload + Auto Assign | Upload ketika `assignPath` aktif | Selesai upload langsung assign | PASS |
| M-15 | Save Indicator | Setelah assign/upload | Status `Menyimpan/Tersimpan` muncul | PASS |
| M-16 | Toast Feedback | Operasi sukses/gagal media | Toast `ok/err` tampil sesuai konteks | PASS |
| M-17 | Undo | Tekan `Undo` di CMS Chrome | Perubahan terakhir kembali | PASS |
| M-18 | Redo | Tekan `Redo` sesudah Undo | Perubahan kembali terapkan | PASS |
| M-19 | Inline Text Save/Cancel | Edit `CmsText`, lalu Simpan/Batal | State bersih, tidak bentrok dengan image edit | PASS |
| M-20 | Media Item Actions | Aksi copy/delete pada mobile | Tombol aksi terlihat dan bisa ditap | PASS |
| M-21 | Layering | Header sticky + modal + toast | Tidak ada overlay conflict | PASS |
| M-22 | Performance Feel | Tap-to-open, assign, close modal | Tidak ada jank/flicker mayor | PASS |

## Regression Watchlist

- Pastikan middleware/auth tidak regress pada runtime (`node:crypto` issue sebelumnya sudah fixed).
- Cek endpoint:
  - `/api/site-media/list`
  - `/api/site-media/upload`
  - `/api/site-media/delete`
  - `/api/site-content`
  - `/api/site-content/restore`
- Verifikasi ulang setelah perubahan env secret/cookie policy.

## Sign-off Template

- QA by: ____________________
- Date: ____________________
- Device/browser:
  - iPhone Safari: ____________________
  - Android Chrome: ____________________
- Result:
  - [ ] Approved for production
  - [ ] Need fixes before release
- Notes:
  - __________________________________
  - __________________________________

