export type RichProductAdvantage = {
  title: string;
  description: string;
};

export type RichProductSectionsVariant = "refrigeration";

export type RichProductDetail = {
  slug: string;
  /** Mengatur ikon & layout khusus (mis. grup komponen berkelompok). */
  sectionsVariant?: RichProductSectionsVariant;
  descriptionHeading: string;
  paragraphs: readonly string[];
  advantagesHeading: string;
  advantages: readonly RichProductAdvantage[];
  specsHeading: string;
  specs: readonly string[];
  applicationsHeading: string;
  applications: readonly string[];
  whyHeading?: string;
  whyBody?: string;
  /** Galeri tambahan (URL di `/media` atau statis). */
  gallery?: readonly { src: string; alt?: string }[];
  /** Slug produk terkait untuk blok tautan. */
  relatedProductSlugs?: readonly string[];
};

export const RICH_PRODUCT_DETAILS: Record<string, RichProductDetail> = {
  "sandwich-panel-pu-camelock": {
    slug: "sandwich-panel-pu-camelock",
    descriptionHeading: "Deskripsi Produk",
    paragraphs: [
      "PU Camlock Panel adalah sistem panel insulasi premium yang dirancang untuk aplikasi ruang bersuhu terkontrol dengan standar industri tinggi. Menggunakan teknologi sambungan camlock presisi, panel ini memastikan koneksi antar modul yang rapat, kuat, dan konsisten sehingga meminimalkan kebocoran udara dan menjaga stabilitas suhu.",
      "Dengan inti polyurethane (PU) ber-density tinggi, panel memberikan performa insulasi optimal serta efisiensi energi yang lebih baik. Sistem ini sangat ideal untuk cold storage, freezer room, clean room, dan berbagai fasilitas industri yang membutuhkan kontrol suhu dan higienitas.",
    ],
    advantagesHeading: "Keunggulan Utama",
    advantages: [
      {
        title: "Precision Camlock System",
        description:
          "Sambungan mekanis presisi yang memastikan panel terpasang rapat, stabil, dan minim celah udara.",
      },
      {
        title: "High Thermal Insulation",
        description:
          "Core polyurethane memberikan nilai insulasi tinggi sehingga suhu lebih stabil dan hemat energi.",
      },
      {
        title: "Air-Tight Performance",
        description:
          "Mengurangi kebocoran udara dan menjaga performa ruang dingin tetap optimal.",
      },
      {
        title: "Efisiensi Instalasi",
        description:
          "Sistem modular mempermudah pemasangan di lapangan dengan waktu lebih cepat dan presisi tinggi.",
      },
      {
        title: "Struktur Kuat & Tahan Lama",
        description:
          "Dirancang untuk penggunaan jangka panjang pada lingkungan industri.",
      },
    ],
    specsHeading: "Spesifikasi Teknis",
    specs: [
      "Core Material: Polyurethane (PU)",
      "Density: ±42–45 kg/m³",
      "Ketebalan Panel: 50 / 75 / 100 / 125 / 150 mm",
      "Lebar Efektif: ±1200 mm",
      "Lapisan Luar: Colorbond steel dengan pilihan skin ( Az070,az100,az150 dan az275) dan ketebalan skin 0.5mm TCt",
      "Sistem Sambungan: Camlock (interlock system)",
      "Finishing: Smooth / Emboss",
    ],
    applicationsHeading: "Aplikasi",
    applications: [
      "Cold Storage (Chiller & Freezer)",
      "Freezer Room",
      "Clean Room (Food & Pharmaceutical)",
      "Ruang Produksi Bersuhu Terkontrol",
    ],
    whyHeading: "Kenapa Pilih PU Camlock Panel?",
    whyBody:
      "Sistem ini memberikan kombinasi optimal antara performa insulasi, kecepatan instalasi, dan ketahanan jangka panjang, menjadikannya solusi ideal untuk kebutuhan industri yang membutuhkan standar kualitas tinggi dan efisiensi operasional.",
  },
  "sandwich-panel-pu-full-knock-down": {
    slug: "sandwich-panel-pu-full-knock-down",
    descriptionHeading: "Deskripsi Produk",
    paragraphs: [
      "PU Knock Down Panel System merupakan sistem panel insulasi modular yang dirancang untuk fleksibilitas tinggi dalam pemasangan, pembongkaran, dan relokasi. Berbeda dengan sistem camlock permanen, panel ini menggunakan metode knock down yang memungkinkan instalasi lebih adaptif tanpa mengurangi performa insulasi.",
      "Dengan inti polyurethane (PU) ber-density tinggi, sistem ini tetap memberikan performa termal yang stabil serta efisiensi energi yang optimal. Sangat cocok untuk kebutuhan ruang yang bersifat dinamis, seperti cold storage sementara, ruang produksi modular, maupun fasilitas yang membutuhkan perubahan layout secara berkala.",
    ],
    advantagesHeading: "Keunggulan Utama",
    advantages: [
      {
        title: "Modular Knock Down System",
        description:
          "Memungkinkan pembongkaran dan pemasangan ulang dengan mudah tanpa merusak struktur panel.",
      },
      {
        title: "Fleksibilitas Tinggi",
        description:
          "Cocok untuk proyek yang membutuhkan perubahan layout atau relokasi.",
      },
      {
        title: "Thermal Insulation Stabil",
        description:
          "Core polyurethane tetap menjaga performa insulasi dengan efisiensi energi yang baik.",
      },
      {
        title: "Instalasi Cepat & Praktis",
        description:
          "Tidak memerlukan sistem penguncian permanen, sehingga lebih mudah dalam pengerjaan.",
      },
      {
        title: "Efisiensi Biaya Jangka Panjang",
        description:
          "Dapat digunakan kembali untuk berbagai proyek atau kebutuhan berbeda.",
      },
    ],
    specsHeading: "Spesifikasi Teknis",
    specs: [
      "Core Material: Polyurethane (PU)",
      "Density: ±42–45 kg/m³",
      "Ketebalan Panel: 50 / 75 / 100 / 125 / 150 mm",
      "Lebar Efektif: ±1200 mm",
      "Lapisan Luar: Colorbond Steel dengan pilihan skin (az070, az100, az150, az275) dengan ketebalan skin 0.5 mm TCT",
      "Sistem Sambungan: Knock Down / Modular Joint System",
      "Finishing: Polos dan alur",
    ],
    applicationsHeading: "Aplikasi",
    applications: [
      "Cold Storage Modular",
      "Ruang Produksi Sementara",
      "Clean Room Modular",
      "Proyek dengan kebutuhan relokasi",
    ],
    whyHeading: "Kenapa Pilih PU Knock Down System?",
    whyBody:
      "Sistem ini menawarkan keseimbangan antara fleksibilitas, efisiensi, dan performa insulasi, menjadikannya solusi ideal untuk kebutuhan industri yang dinamis dan tidak permanen.",
  },
  "sandwich-panel-eps": {
    slug: "sandwich-panel-eps",
    descriptionHeading: "Deskripsi Produk",
    paragraphs: [
      "EPS Sandwich Panel merupakan solusi panel insulasi yang ekonomis dengan inti Expanded Polystyrene (EPS) yang ringan dan efisien. Dirancang untuk aplikasi konstruksi industri dengan kebutuhan insulasi standar, panel ini menawarkan kombinasi antara kemudahan instalasi, efisiensi biaya, dan performa yang cukup untuk berbagai penggunaan umum.",
      "Struktur panel terdiri dari lapisan baja berlapis dengan inti EPS yang memberikan bobot ringan sekaligus menjaga kestabilan struktur. Sistem ini sangat cocok untuk bangunan industri, gudang, partisi, dan aplikasi non-suhu ekstrem.",
    ],
    advantagesHeading: "Keunggulan Utama",
    advantages: [
      {
        title: "Cost Efficient Solution",
        description:
          "Pilihan paling ekonomis untuk kebutuhan panel insulasi.",
      },
      {
        title: "Lightweight Structure",
        description:
          "Bobot ringan memudahkan transportasi dan pemasangan.",
      },
      {
        title: "Instalasi Cepat & Praktis",
        description:
          "Mempercepat proses konstruksi tanpa kebutuhan sistem kompleks.",
      },
      {
        title: "Fleksibel untuk Berbagai Aplikasi",
        description:
          "Cocok untuk dinding, partisi, dan bangunan industri umum.",
      },
      {
        title: "Perawatan Mudah",
        description:
          "Material sederhana dengan kebutuhan maintenance minimal.",
      },
    ],
    specsHeading: "Spesifikasi Teknis",
    specs: [
      "Core Material: Expanded Polystyrene (EPS)",
      "Density: ±12–20 kg/m³",
      "Ketebalan Panel: 50 / 75 mm",
      "Lebar Efektif: ±1200 mm",
      "Lapisan Luar: Color Coated Steel / Galvalume",
      "Sistem Sambungan: Interlock / Overlap",
      "Finishing: Polos / Alur",
    ],
    applicationsHeading: "Aplikasi",
    applications: [
      "Gudang & Warehouse",
      "Partisi Industri",
      "Bangunan Sementara",
      "Dinding & Atap Pabrik",
    ],
    whyHeading: "Kenapa Pilih EPS Sandwich Panel?",
    whyBody:
      "EPS Panel adalah solusi ideal untuk kebutuhan konstruksi yang mengutamakan efisiensi biaya, kemudahan instalasi, dan fleksibilitas penggunaan, tanpa memerlukan performa insulasi tingkat tinggi.",
  },
  "cold-storage-custom": {
    slug: "cold-storage-custom",
    descriptionHeading: "Deskripsi Produk",
    paragraphs: [
      "Cold Storage System merupakan solusi pendinginan terintegrasi yang dirancang secara khusus (custom-engineered) untuk memenuhi kebutuhan penyimpanan dan proses industri dengan kontrol suhu yang presisi.",
      "Sistem ini mencakup panel insulasi berkinerja tinggi, sistem refrigerasi, pintu khusus cold room, serta kontrol suhu digital, yang dirancang berdasarkan kebutuhan kapasitas, suhu operasional, dan alur kerja pengguna.",
      "Baik untuk aplikasi chiller, freezer, maupun process area, sistem ini memastikan kestabilan suhu, efisiensi energi, dan keandalan operasional dalam jangka panjang.",
    ],
    advantagesHeading: "Keunggulan Utama",
    advantages: [
      {
        title: "Custom-Engineered Design",
        description:
          "Setiap sistem dirancang sesuai kebutuhan kapasitas, suhu, dan layout proyek.",
      },
      {
        title: "Precise Temperature Control",
        description:
          "Menjaga suhu tetap stabil untuk menjaga kualitas produk.",
      },
      {
        title: "Energy Efficient System",
        description:
          "Optimasi desain untuk konsumsi energi yang lebih efisien.",
      },
      {
        title: "Integrated Solution",
        description:
          "Menggabungkan panel, mesin pendingin, pintu, dan kontrol dalam satu sistem.",
      },
      {
        title: "Reliable Industrial Performance",
        description:
          "Dirancang untuk operasional jangka panjang dengan standar industri.",
      },
    ],
    specsHeading: "Spesifikasi Umum",
    specs: [
      "Tipe Sistem: Chiller / Freezer / Process Area",
      "Rentang Suhu — Chiller: ±0°C hingga +10°C",
      "Rentang Suhu — Freezer: hingga -25°C (atau sesuai kebutuhan)",
      "Panel Insulasi: PU Camlock Panel",
      "Ketebalan Panel: 50 – 150 mm",
      "Pintu: Sliding / Swing Cold Room Door",
      "Sistem Pendingin: Condensing Unit + Evaporator",
      "Kontrol: Digital Temperature Controller",
    ],
    applicationsHeading: "Aplikasi",
    applications: [
      "Industri Makanan & Minuman",
      "Cold Chain Logistics",
      "Farmasi & Medis",
      "Area Produksi Bersuhu Terkontrol",
      "Gudang Distribusi",
    ],
    whyHeading: "Kenapa Pilih Sistem Ini?",
    whyBody:
      "Cold Storage System memberikan solusi menyeluruh dengan desain yang disesuaikan, performa stabil, dan efisiensi operasional, menjadikannya pilihan ideal untuk kebutuhan industri dengan standar tinggi.",
  },
  "pembekuan-cepat-abf": {
    slug: "pembekuan-cepat-abf",
    descriptionHeading: "Deskripsi Produk",
    paragraphs: [
      "Air Blast Freezer (ABF) adalah sistem pembekuan cepat yang dirancang untuk menurunkan suhu produk secara signifikan dalam waktu singkat, sehingga menjaga kualitas, tekstur, dan nilai nutrisi tetap optimal.",
      "Dengan teknologi aliran udara berkecepatan tinggi (high velocity airflow) dan kontrol suhu yang presisi, ABF memungkinkan proses pembekuan yang merata hingga ke inti produk. Sistem ini sangat ideal untuk industri makanan, seafood, daging, dan produk lain yang membutuhkan proses pembekuan cepat (rapid freezing).",
    ],
    advantagesHeading: "Keunggulan Utama",
    advantages: [
      {
        title: "Rapid Freezing Performance",
        description:
          "Membekukan produk dalam waktu singkat untuk menjaga kualitas.",
      },
      {
        title: "Uniform Freezing System",
        description:
          "Distribusi udara dingin merata hingga ke seluruh bagian produk.",
      },
      {
        title: "Product Quality Preservation",
        description:
          "Menjaga tekstur, warna, dan kandungan nutrisi produk.",
      },
      {
        title: "High Efficiency Operation",
        description:
          "Optimal dalam proses produksi dengan efisiensi energi yang baik.",
      },
      {
        title: "Custom-Engineered Design",
        description:
          "Dirancang sesuai kapasitas dan kebutuhan proses industri.",
      },
    ],
    specsHeading: "Spesifikasi Umum",
    specs: [
      "Suhu Operasional: hingga -40°C",
      "Sistem Pendingin: Industrial Refrigeration System",
      "Airflow: High Velocity Air Circulation",
      "Panel Insulasi: PU Camlock Panel",
      "Ketebalan Panel: 150 mm",
      "Sistem Kontrol: Digital Control System",
      "Tipe Sistem: Batch / Continuous (custom)",
    ],
    applicationsHeading: "Aplikasi",
    applications: [
      "Industri Seafood",
      "Pengolahan Daging & Ayam",
      "Industri Makanan Beku",
      "Produk Perikanan & Olahan",
    ],
    whyHeading: "Kenapa Pilih ABF?",
    whyBody:
      "Air Blast Freezer memberikan solusi pembekuan cepat dengan hasil optimal, efisiensi tinggi, dan kualitas produk terjaga, menjadikannya pilihan utama untuk industri pengolahan makanan modern.",
  },
  "cold-storage-portable": {
    slug: "cold-storage-portable",
    descriptionHeading: "Deskripsi Produk",
    paragraphs: [
      "Portable Cold Storage adalah solusi pendinginan siap pakai (plug & play) yang dirancang untuk kebutuhan penyimpanan suhu terkontrol tanpa proses konstruksi yang kompleks. Sistem ini mengintegrasikan panel insulasi, unit pendingin, dan sistem kontrol dalam satu unit yang praktis dan efisien.",
      "Dirancang untuk fleksibilitas tinggi, unit ini dapat dengan mudah dipindahkan, dipasang, dan digunakan sesuai kebutuhan operasional. Sangat ideal untuk kebutuhan sementara, ekspansi kapasitas, atau solusi cepat tanpa investasi konstruksi permanen.",
    ],
    advantagesHeading: "Keunggulan Utama",
    advantages: [
      {
        title: "Plug & Play System",
        description:
          "Siap digunakan tanpa instalasi konstruksi tambahan.",
      },
      {
        title: "Mobile & Flexible",
        description:
          "Mudah dipindahkan sesuai kebutuhan lokasi.",
      },
      {
        title: "Fast Deployment",
        description:
          "Waktu implementasi jauh lebih cepat dibanding sistem konvensional.",
      },
      {
        title: "Compact & Efficient",
        description:
          "Desain ringkas dengan performa pendinginan optimal.",
      },
      {
        title: "Cost Efficient Solution",
        description:
          "Mengurangi biaya konstruksi dan waktu pengerjaan.",
      },
    ],
    specsHeading: "Spesifikasi Umum",
    specs: [
      "Tipe Sistem: Portable / Modular Unit",
      "Rentang Suhu — Chiller: ±0°C hingga +10°C",
      "Rentang Suhu — Freezer: hingga -20°C (custom)",
      "Panel Insulasi: PU Panel",
      "Ketebalan Panel: 50 – 100 mm",
      "Sistem Pendingin: Built-in Condensing Unit",
      "Kontrol: Digital Temperature Controller",
      "Mobilitas: Relocatable Unit",
    ],
    applicationsHeading: "Aplikasi",
    applications: [
      "Penyimpanan sementara",
      "Backup cold storage",
      "Event & distribusi",
      "Industri makanan & logistik",
      "Proyek dengan kebutuhan fleksibel",
    ],
    whyHeading: "Kenapa Pilih Portable Cold Storage?",
    whyBody:
      "Portable Cold Storage memberikan solusi praktis dengan instalasi cepat, fleksibilitas tinggi, dan efisiensi biaya, menjadikannya pilihan ideal untuk kebutuhan pendinginan yang dinamis.",
  },
  "pintu-panel": {
    slug: "pintu-panel",
    descriptionHeading: "Deskripsi Produk",
    paragraphs: [
      "Cold Room Door adalah sistem pintu khusus yang dirancang untuk aplikasi cold storage dan ruang bersuhu terkontrol. Dengan konstruksi berinsulasi tinggi dan sistem sealing yang presisi, pintu ini mampu menjaga kestabilan suhu serta meminimalkan kebocoran udara.",
      "Dirancang untuk penggunaan industri, pintu ini tersedia dalam berbagai tipe seperti sliding door dan swing door, dengan performa yang andal, mudah dioperasikan, dan tahan terhadap kondisi suhu rendah.",
    ],
    advantagesHeading: "Keunggulan Utama",
    advantages: [
      {
        title: "Air-Tight Sealing System",
        description:
          "Menjamin penutupan rapat untuk menjaga suhu tetap stabil.",
      },
      {
        title: "High Insulation Performance",
        description:
          "Mengurangi kehilangan suhu dan meningkatkan efisiensi energi.",
      },
      {
        title: "Smooth & Reliable Operation",
        description:
          "Sistem buka-tutup ringan, aman, dan tahan lama.",
      },
      {
        title: "Durable Construction",
        description:
          "Material kuat dan tahan terhadap lingkungan suhu ekstrem.",
      },
      {
        title: "Custom Size & Configuration",
        description:
          "Tersedia berbagai ukuran dan spesifikasi sesuai kebutuhan proyek.",
      },
    ],
    specsHeading: "Spesifikasi Umum",
    specs: [
      "Tipe: Sliding Door / Swing Door",
      "Material: Insulated Panel (PU Core)",
      "Ketebalan: ±50 – 150 mm",
      "Sistem Seal: Rubber Gasket / Magnetic Seal",
      "Frame: Aluminium / Steel Frame",
      "Aksesoris: Handle, Locking System, Safety Release",
      "Aplikasi Suhu: Chiller & Freezer",
    ],
    applicationsHeading: "Aplikasi",
    applications: [
      "Cold Storage",
      "Freezer Room",
      "Clean Room",
      "Industri Makanan & Farmasi",
    ],
    whyHeading: "Kenapa Pilih Cold Room Door?",
    whyBody:
      "Pintu ini memastikan kinerja sistem cold storage tetap optimal, dengan sealing yang rapat, daya tahan tinggi, dan kemudahan operasional untuk penggunaan industri.",
  },
  "loading-dock-system": {
    slug: "loading-dock-system",
    descriptionHeading: "Deskripsi Produk",
    paragraphs: [
      "Loading Dock System adalah solusi terintegrasi yang dirancang untuk mengoptimalkan proses bongkar muat barang secara efisien, aman, dan terkontrol. Sistem ini menghubungkan area gudang dengan kendaraan logistik melalui kombinasi dock leveler, dock shelter, high speed door, dan sectional door, sehingga menciptakan proses transfer barang yang stabil dan terlindungi.",
      "Dalam aplikasi cold storage, sistem ini juga berperan penting dalam menjaga kestabilan suhu dengan meminimalkan pertukaran udara antara area dalam dan luar, sehingga meningkatkan efisiensi energi dan menjaga kualitas produk.",
    ],
    advantagesHeading: "Keunggulan Utama",
    advantages: [
      {
        title: "Efficient Loading & Unloading",
        description:
          "Mempercepat proses bongkar muat dan meningkatkan produktivitas.",
      },
      {
        title: "Stable Docking Platform",
        description:
          "Dock leveler memastikan posisi sejajar antara gudang dan kendaraan.",
      },
      {
        title: "Temperature Control Efficiency",
        description:
          "Mengurangi kehilangan suhu selama proses loading.",
      },
      {
        title: "Operational Safety & Reliability",
        description:
          "Dirancang untuk operasional yang aman dan stabil.",
      },
      {
        title: "Integrated Dock System",
        description:
          "Seluruh komponen bekerja sebagai satu sistem yang efisien.",
      },
    ],
    specsHeading: "Komponen Sistem",
    specs: [
      "1. Dock Leveler",
      "Menyesuaikan perbedaan tinggi antara lantai gudang dan kendaraan",
      "Tipe: Hydraulic / Mechanical",
      "Konstruksi heavy-duty untuk beban industri",
      "2. Dock Shelter / Dock Seal",
      "Menutup celah antara kendaraan dan bangunan",
      "Mengurangi pertukaran udara dan kehilangan suhu",
      "Melindungi dari debu, hujan, dan lingkungan luar",
      "3. High Speed Door (HSD / FSHD)",
      "Pintu otomatis berkecepatan tinggi untuk area loading",
      "Membuka & menutup cepat untuk meminimalkan kehilangan suhu",
      "Meningkatkan efisiensi alur logistik",
      "Tipe — HSD: area umum & distribusi",
      "Tipe — FSHD: khusus area freezer / suhu rendah",
      "4. Sectional Door",
      "Pintu industri dengan sistem bukaan vertikal (ke atas)",
      "Menghemat ruang dan cocok untuk area loading dock",
      "Struktur kuat dan tahan penggunaan intensif",
      "Keunggulan — Hemat ruang (vertical opening system)",
      "Keunggulan — Tahan lama & stabil",
      "Keunggulan — Cocok untuk area gudang & distribusi",
      "Keunggulan — Dapat dikombinasikan dengan sistem docking lainnya",
    ],
    applicationsHeading: "Aplikasi",
    applications: [
      "Gudang & Warehouse",
      "Cold Storage & Distribution Center",
      "Industri Logistik",
      "Pabrik & Area Produksi",
    ],
    whyHeading: "Kenapa Pilih Loading Dock System?",
    whyBody:
      "Loading Dock System memberikan kombinasi optimal antara efisiensi operasional, keamanan, dan kontrol lingkungan, menjadikannya solusi penting untuk fasilitas logistik modern.",
  },
  "sistem-refrigerasi": {
    slug: "sistem-refrigerasi",
    sectionsVariant: "refrigeration",
    descriptionHeading: "Deskripsi Produk",
    paragraphs: [
      "Refrigeration System adalah sistem pendingin terintegrasi yang dirancang untuk memenuhi kebutuhan cold storage, freezer, dan area proses industri dengan performa tinggi dan kontrol suhu yang presisi.",
      "Sistem ini mencakup condensing unit, compressor (semi hermetic single stage & two stage), condenser, evaporator, serta sistem kontrol terintegrasi, yang dirancang berdasarkan kapasitas, suhu operasional, dan kebutuhan aplikasi.",
      "Dengan teknologi modern dan desain engineering yang optimal, sistem ini memberikan efisiensi energi, stabilitas suhu, dan keandalan operasional jangka panjang.",
    ],
    advantagesHeading: "Keunggulan Utama",
    advantages: [
      {
        title: "High Performance Cooling System",
        description:
          "Menjamin performa pendinginan optimal untuk berbagai aplikasi industri.",
      },
      {
        title: "Flexible System Configuration",
        description:
          "Tersedia pilihan single stage dan two stage sesuai kebutuhan suhu.",
      },
      {
        title: "Energy Efficient Operation",
        description:
          "Dirancang untuk efisiensi energi dan biaya operasional.",
      },
      {
        title: "Integrated Control System",
        description:
          "Sistem kontrol modern dengan monitoring yang akurat.",
      },
      {
        title: "Reliable Industrial Design",
        description:
          "Konstruksi kuat untuk penggunaan jangka panjang.",
      },
    ],
    specsHeading: "Komponen Sistem",
    specs: [
      "1. Condensing Unit",
      "Unit utama sistem pendingin",
      "Tersedia berbagai kapasitas sesuai kebutuhan",
      "Cocok untuk aplikasi chiller & freezer",
      "2. Compressor System",
      "Semi Hermetic Compressor",
      "Single Stage: untuk suhu medium (chiller)",
      "Two Stage: untuk suhu rendah (freezer)",
      "Performa stabil dan tahan lama",
      "3. Condenser",
      "Membuang panas dari sistem refrigerasi",
      "Tipe: Air Cooled / Water Cooled",
      "Efisiensi tinggi dalam pelepasan panas",
      "4. Evaporator",
      "Menyerap panas dari ruang cold storage",
      "Distribusi udara dingin merata",
      "Menjaga kestabilan suhu ruang",
      "5. Control System (Remote Integrated)",
      "Sistem kontrol digital terintegrasi",
      "Monitoring suhu & performa secara real-time",
      "Dapat diakses secara remote (jarak jauh)",
      "Memudahkan operasional & maintenance",
    ],
    applicationsHeading: "Aplikasi",
    applications: [
      "Cold Storage (Chiller & Freezer)",
      "Air Blast Freezer (ABF)",
      "Process Cooling Area",
      "Industri Makanan & Farmasi",
    ],
    whyHeading: "Kenapa Pilih Refrigeration System?",
    whyBody:
      "Refrigeration System memberikan solusi pendinginan dengan kontrol presisi, efisiensi energi, dan keandalan tinggi, menjadikannya komponen utama dalam sistem cold chain modern.",
  },
  "maintenance-berkala": {
    slug: "maintenance-berkala",
    descriptionHeading: "🔧 Maintenance Berkala",
    paragraphs: [
      "Menjaga performa sistem tetap stabil dan efisien.",
      "Layanan maintenance berkala dirancang untuk memastikan sistem refrigerasi, cold room, dan komponen pendukung tetap bekerja optimal dalam jangka panjang. Pemeriksaan dilakukan secara terjadwal untuk meminimalkan potensi gangguan operasional dan menjaga stabilitas suhu sesuai kebutuhan proyek.",
    ],
    advantagesHeading: "Cakupan layanan",
    advantages: [
      {
        title: "Pemeriksaan sistem refrigerasi",
        description:
          "Pengecekan kompresor, evaporator, condenser, tekanan refrigerant, oil system, dan performa pendinginan secara menyeluruh.",
      },
      {
        title: "Kalibrasi & kontrol suhu",
        description:
          "Verifikasi sensor, thermostat, control panel, dan parameter operasional untuk memastikan kestabilan suhu tetap terjaga.",
      },
      {
        title: "Pemeriksaan panel & sambungan",
        description:
          "Inspeksi kondisi panel insulated, joint system, sealant, camlock, dan potensi thermal leakage.",
      },
      {
        title: "Cleaning & preventive maintenance",
        description:
          "Pembersihan unit pendingin, condenser coil, drain system, serta tindakan preventif untuk menjaga efisiensi kerja mesin.",
      },
      {
        title: "Laporan teknis berkala",
        description:
          "Setiap kunjungan maintenance dilengkapi dokumentasi pemeriksaan dan rekomendasi teknis untuk kebutuhan monitoring operasional.",
      },
    ],
    specsHeading: "Keunggulan layanan",
    specs: [
      "Jadwal maintenance terstruktur",
      "Mengurangi risiko downtime operasional",
      "Menjaga efisiensi energi sistem",
      "Memperpanjang usia pakai equipment",
      "Dokumentasi service yang rapi dan terukur",
    ],
    applicationsHeading: "Area penerapan",
    applications: [
      "Cold storage (chiller & freezer)",
      "Ruang proses bersuhu terkontrol",
      "Sistem refrigerasi industri",
      "Fasilitas operasional rantai dingin",
    ],
  },
  "perbaikan-troubleshooting": {
    slug: "perbaikan-troubleshooting",
    descriptionHeading: "🛠 Perbaikan & Troubleshooting",
    paragraphs: [
      "Respons teknis cepat untuk meminimalkan gangguan operasional.",
      "Tim teknis kami menangani proses diagnosa, perbaikan, dan troubleshooting sistem pendingin dengan pendekatan terukur dan sesuai standar operasional proyek.",
    ],
    advantagesHeading: "Penanganan yang tersedia",
    advantages: [
      {
        title: "Diagnosa gangguan sistem",
        description:
          "Identifikasi masalah pada unit refrigerasi, electrical control, airflow, tekanan refrigerant, hingga performa pendinginan.",
      },
      {
        title: "Perbaikan unit refrigerasi",
        description:
          "Penanganan kerusakan kompresor, evaporator, condenser, fan motor, control panel, dan komponen pendukung lainnya.",
      },
      {
        title: "Penanganan penurunan performa suhu",
        description:
          "Evaluasi penyebab suhu tidak stabil, pembentukan frost berlebih, kebocoran sistem, atau penurunan kapasitas pendinginan.",
      },
      {
        title: "Penggantian spare part",
        description:
          "Koordinasi penggantian komponen sesuai kebutuhan sistem dan spesifikasi operasional.",
      },
      {
        title: "Pengujian pasca perbaikan",
        description:
          "Sistem diuji kembali untuk memastikan performa pendinginan kembali stabil sebelum digunakan operasional.",
      },
    ],
    specsHeading: "Fokus layanan",
    specs: [
      "Respons teknis cepat",
      "Analisis masalah yang terukur",
      "Meminimalkan downtime operasional",
      "Dukungan teknisi berpengalaman",
      "Penanganan sesuai standar kerja lapangan",
    ],
    applicationsHeading: "Area penanganan",
    applications: [
      "Gangguan sistem pendingin industri",
      "Penurunan performa suhu ruang dingin",
      "Kebutuhan perbaikan unit refrigerasi",
      "Situasi operasional dengan target downtime minimum",
    ],
  },
  "after-sales-support": {
    slug: "after-sales-support",
    descriptionHeading: "🤝 After Sales Support",
    paragraphs: [
      "Dukungan teknis berkelanjutan setelah proyek selesai.",
      "Kami tidak berhenti pada tahap instalasi dan commissioning. Tim kami tetap mendukung kebutuhan operasional melalui koordinasi teknis, konsultasi sistem, dan layanan purna jual yang berkelanjutan.",
    ],
    advantagesHeading: "Dukungan yang diberikan",
    advantages: [
      {
        title: "Konsultasi teknis operasional",
        description:
          "Pendampingan penggunaan sistem pendingin dan rekomendasi operasional sesuai kebutuhan lapangan.",
      },
      {
        title: "Dukungan spare part",
        description:
          "Koordinasi kebutuhan spare part dan komponen pendukung untuk menjaga keberlangsungan sistem.",
      },
      {
        title: "Monitoring & evaluasi sistem",
        description:
          "Evaluasi performa sistem berdasarkan kondisi operasional dan kebutuhan penggunaan aktual.",
      },
      {
        title: "Penyesuaian kebutuhan operasional",
        description:
          "Dukungan upgrade, penyesuaian kapasitas, maupun pengembangan sistem sesuai pertumbuhan kebutuhan proyek.",
      },
      {
        title: "Koordinasi teknis berkelanjutan",
        description:
          "Komunikasi teknis untuk membantu proses maintenance, troubleshooting, dan kebutuhan operasional jangka panjang.",
      },
    ],
    specsHeading: "Fokus dukungan",
    specs: [
      "Pendampingan operasional pasca commissioning",
      "Koordinasi teknis lintas tim",
      "Dukungan spare part terencana",
      "Evaluasi performa sistem secara berkala",
      "Rencana pengembangan sesuai kebutuhan proyek",
    ],
    applicationsHeading: "Skema dukungan",
    applications: [
      "Fase transisi setelah instalasi",
      "Operasional harian cold room dan refrigerasi",
      "Kebutuhan upgrade dan ekspansi kapasitas",
      "Program service berkelanjutan jangka panjang",
    ],
  },
};

export function getRichProductDetail(slug: string): RichProductDetail | undefined {
  return RICH_PRODUCT_DETAILS[slug];
}
