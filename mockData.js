// SITAMA-DEEP Database & Initial Mock Data
// Selaras 100% dengan Dokumen GEMPITA 2026 Kepemimpinan Pembelajaran Sudarso, S.Pd.
// Satuan Pendidikan: SMK Negeri Wonosalam, Cabang Dinas Pendidikan Kab. Jombang

const initialMockData = {
  school: {
    id: "SCH01",
    school_name: "SMK NEGERI WONOSALAM",
    npsn: "20503412",
    cabdin: "Cabang Dinas Pendidikan Wilayah Kabupaten Jombang",
    provinsi: "Pemerintah Provinsi Jawa Timur",
    dinas: "Dinas Pendidikan Provinsi Jawa Timur",
    address: "Jl. Anjasmoro, Dsn. Pucangrejo, Ds. Wonosalam, Kec. Wonosalam, Kab. Jombang, Jawa Timur 61476",
    phone: "+62 815-1594-0188",
    email: "smkn.wonosalam.jbg@gmail.com",
    webmail: "noreply-sitama@smknwonosalam.sch.id",
    principal_name: "Sudarso, S.Pd.",
    principal_nip: "197609232008011006",
    stats: {
      students_count: 822,
      teachers_staff_count: 62,
      rombel_count: 24,
      departments_count: 4
    },
    logo: "logo.png"
  },

  // 4 Konsentrasi Keahlian Resmi SMKN Wonosalam
  departments: [
    { id: "KOMP-ATP", code: "ATP", name: "Agribisnis Tanaman Perkebunan", head: "Budi Santoso, S.Pd.", color: "#10B981", icon: "🌱" },
    { id: "KOMP-KLN", code: "Kuliner", name: "Kuliner / Tata Boga", head: "Dewi Lestari, S.Pd., M.Par.", color: "#F59E0B", icon: "🍳" },
    { id: "KOMP-TKR", code: "TKR", name: "Teknik Kendaraan Ringan", head: "Ahmad Fauzi, S.T.", color: "#3B82F6", icon: "🚗" },
    { id: "KOMP-TPM", code: "TPM", name: "Teknik Pemesinan", head: "Joko Widodo, S.T.", color: "#8B5CF6", icon: "⚙️" },
    { id: "KOMP-UMM", code: "Umum", name: "Mata Pelajaran Umum & IPAS", head: "Rudi Hermawan, S.Si.", color: "#06B6D4", icon: "📚" }
  ],

  // 4 Tingkatan Akun / Level Pengguna:
  // 1. Admin (Siti Rahmawati, S.Kom.)
  // 2. Kepala Sekolah & Waka (Sudarso, S.Pd. & Drs. Bambang Supriyadi)
  // 3. Guru (Budi Santoso, Dewi Lestari, Ahmad Fauzi, Joko Widodo, Rudi Hermawan)
  // 4. Tendik / Tata Usaha (Tri Wahyuni, S.AP.)
  users: [
    {
      id: "USR-001",
      name: "Siti Rahmawati, S.Kom.",
      title_badge: "Administrator Sistem",
      email: "admin@smknwonosalam.sch.id",
      username: "admin",
      password: "password123",
      role: "admin",
      nip: "198504122010012003",
      phone: "081234567890",
      status: "Active",
      department: "Pengelola Sistem & IT",
      language_preference: "id"
    },
    {
      id: "USR-002",
      name: "Sudarso, S.Pd.",
      title_badge: "Kepala Sekolah",
      email: "sudarso.kepsek@smknwonosalam.sch.id",
      username: "kepsek",
      password: "password123",
      role: "principal",
      nip: "197609232008011006",
      phone: "+62 815-1594-0188",
      status: "Active",
      department: "Manajemen Sekolah",
      language_preference: "id"
    },
    {
      id: "USR-002B",
      name: "Drs. Bambang Supriyadi",
      title_badge: "Waka Kurikulum",
      email: "waka.kurikulum@smknwonosalam.sch.id",
      username: "waka_kurikulum",
      password: "password123",
      role: "principal",
      nip: "197105141998021003",
      phone: "081331234567",
      status: "Active",
      department: "Bidang Kurikulum & Pembelajaran",
      language_preference: "id"
    },
    {
      id: "USR-003",
      name: "Budi Santoso, S.Pd.",
      title_badge: "Guru ATP",
      email: "budi.santoso@smknwonosalam.sch.id",
      username: "guru_atp",
      password: "password123",
      role: "teacher",
      nip: "198807212015021001",
      phone: "085678901234",
      status: "Active",
      department: "ATP",
      subject_name: "Dasar Budidaya Tanaman Perkebunan (Kopi & Cengkeh)",
      language_preference: "id"
    },
    {
      id: "USR-004",
      name: "Dewi Lestari, S.Pd., M.Par.",
      title_badge: "Guru Kuliner",
      email: "dewi.lestari@smknwonosalam.sch.id",
      username: "guru_kuliner",
      password: "password123",
      role: "teacher",
      nip: "199011042018012004",
      phone: "087812345678",
      status: "Active",
      department: "Kuliner",
      subject_name: "Inovasi Pengolahan Kuliner Nusantara & Buah Lokal",
      language_preference: "id"
    },
    {
      id: "USR-005",
      name: "Ahmad Fauzi, S.T.",
      title_badge: "Guru TKR",
      email: "ahmad.fauzi@smknwonosalam.sch.id",
      username: "guru_tkr",
      password: "password123",
      role: "teacher",
      nip: "198903122019031008",
      phone: "082134567891",
      status: "Active",
      department: "TKR",
      subject_name: "Pemeliharaan Mesin Kendaraan Ringan (EFI & Hybrid)",
      language_preference: "id"
    },
    {
      id: "USR-006",
      name: "Joko Widodo, S.T.",
      title_badge: "Guru TPM",
      email: "joko.widodo@smknwonosalam.sch.id",
      username: "guru_tpm",
      password: "password123",
      role: "teacher",
      nip: "199108192020011005",
      phone: "081987654321",
      status: "Active",
      department: "TPM",
      subject_name: "Teknik Pemesinan Bubut & Frais CNC",
      language_preference: "id"
    },
    {
      id: "USR-007",
      name: "Rudi Hermawan, S.Si.",
      title_badge: "Guru IPAS",
      email: "rudi.hermawan@smknwonosalam.sch.id",
      username: "guru_ipas",
      password: "password123",
      role: "teacher",
      nip: "199205182020011002",
      phone: "082345678912",
      status: "Active",
      department: "Umum",
      subject_name: "Projek IPAS & Konservasi Wonosalam",
      language_preference: "id"
    },
    {
      id: "USR-008",
      name: "Tri Wahyuni, S.AP.",
      title_badge: "Tata Usaha / Tendik",
      email: "tri.wahyuni@smknwonosalam.sch.id",
      username: "tendik_tu",
      password: "password123",
      role: "tendik",
      nip: "198706152014032002",
      phone: "081398765432",
      status: "Active",
      department: "Tata Usaha / Administrasi Kurikulum",
      subject_name: "Pengadministrasi Buku Kendali & Arsip Modul",
      language_preference: "id"
    }
  ],

  academicYears: [
    { id: "AY-2025-1", year_name: "2025/2026", semester: "Ganjil", status: "Active" },
    { id: "AY-2025-2", year_name: "2025/2026", semester: "Genap", status: "Upcoming" },
    { id: "AY-2024-2", year_name: "2024/2025", semester: "Genap", status: "Archived" }
  ],

  subjects: [
    { id: "SUB-01", code: "ATP-01", department: "ATP", name_id: "Dasar Budidaya Tanaman Perkebunan (Kopi & Cengkeh)", name_en: "Foundations of Plantation Crops (Coffee & Clove)", description: "Kompetensi kejuruan ATP lereng Anjasmoro" },
    { id: "SUB-02", code: "KLN-01", department: "Kuliner", name_id: "Inovasi Pengolahan Kuliner Nusantara & Buah Lokal", name_en: "Culinary Innovation & Local Produce Processing", description: "Pengolahan produk kuliner khas komoditas Wonosalam" },
    { id: "SUB-03", code: "TKR-01", department: "TKR", name_id: "Pemeliharaan Mesin Kendaraan Ringan (EFI & Hybrid)", name_en: "Light Vehicle Engine Maintenance (EFI & Hybrid)", description: "Diagnostik engine elektronika dan sensor kendaraan" },
    { id: "SUB-04", code: "TPM-01", department: "TPM", name_id: "Teknik Pemesinan Bubut & Frais CNC", name_en: "CNC Lathe & Milling Machining Techniques", description: "Fabrikasi presisi komponen mekanik dan manufaktur" },
    { id: "SUB-05", code: "IPS-01", department: "Umum", name_id: "Projek IPAS & Konservasi Sumber Daya Alam Wonosalam", name_en: "Applied Natural Science & Environmental Project", description: "Integrasi saintifik dan kearifan ekologi lokal" },
    { id: "SUB-06", code: "BIN-01", department: "Umum", name_id: "Bahasa Indonesia & Literasi Komunikasi Kejuruan", name_en: "Indonesian Language & Vocational Communication", description: "Literasi laporan teknis dan presentasi kerja" },
    { id: "SUB-07", code: "MAT-01", department: "Umum", name_id: "Matematika Terapan Kejuruan & Kalkulasi Biaya Produksi", name_en: "Applied Vocational Mathematics & Costing", description: "Perhitungan estimasi presisi dan analisis usaha" }
  ],

  classes: [
    { id: "CLS-10-ATP", class_name: "X ATP 1", phase: "Fase E", level: "10", department: "ATP", description: "Agribisnis Tanaman Perkebunan Kelas X" },
    { id: "CLS-11-ATP", class_name: "XI ATP 1", phase: "Fase F", level: "11", department: "ATP", description: "Agribisnis Tanaman Perkebunan Kelas XI" },
    { id: "CLS-10-KLN", class_name: "X Kuliner 1", phase: "Fase E", level: "10", department: "Kuliner", description: "Kuliner / Tata Boga Kelas X" },
    { id: "CLS-11-KLN", class_name: "XI Kuliner 1", phase: "Fase F", level: "11", department: "Kuliner", description: "Kuliner / Tata Boga Kelas XI" },
    { id: "CLS-10-TKR", class_name: "X TKR 1", phase: "Fase E", level: "10", department: "TKR", description: "Teknik Kendaraan Ringan Kelas X" },
    { id: "CLS-11-TKR", class_name: "XI TKR 1", phase: "Fase F", level: "11", department: "TKR", description: "Teknik Kendaraan Ringan Kelas XI" },
    { id: "CLS-10-TPM", class_name: "X TPM 1", phase: "Fase E", level: "10", department: "TPM", description: "Teknik Pemesinan Kelas X" },
    { id: "CLS-11-TPM", class_name: "XI TPM 1", phase: "Fase F", level: "11", department: "TPM", description: "Teknik Pemesinan Kelas XI" }
  ],

  // 5 Modul Riil Selaras Dokumen GEMPITA (92%, 59% (111/188), 72%, 55% (104/188), Pending)
  modules: [
    {
      id: "MOD-001",
      teacher_id: "USR-003",
      teacher_name: "Budi Santoso, S.Pd.",
      nip: "198807212015021001",
      department: "ATP",
      subject_name: "Dasar Budidaya Tanaman Perkebunan (Kopi & Cengkeh)",
      class_name: "X ATP 1",
      phase: "Fase E",
      semester: "Ganjil",
      academic_year: "2025/2026",
      title: "Teknik Budidaya & Pemangkasan Tanaman Kopi Robusta Wonosalam Berbasis Mindful Learning",
      topic: "Pemeliharaan dan Pemangkasan Bentuk Kopi Organik",
      learning_outcomes: "Peserta didik mampu menerapkan teknik penanaman dan pemangkasan tanaman kopi secara terukur dengan memperhatikan kelestarian tanah dan ekosistem lereng pegunungan Anjasmoro.",
      learning_objectives: "1. Mengidentifikasi cabang produktif tanaman kopi dengan teliti. 2. Melakukan pemangkasan bentuk dan pemangkasan produksi secara aman dan higienis. 3. Melakukan refleksi mendalam terhadap efisiensi fotosintesis pasca pemangkasan.",
      file_name: "Modul_Ajar_ATP_Kopi_Wonosalam_BudiSantoso.pdf",
      file_size: "3.4 MB",
      version_number: 2,
      status: "Approved",
      submitted_at: "2025-09-02 08:30",
      reviewed_at: "2025-09-06 14:15",
      tendik_verification: {
        verified_by: "Tri Wahyuni, S.AP.",
        verified_at: "2025-09-07 09:30",
        archive_code: "ARSIP-2025/ATP/MOD-001",
        physical_status: "Lengkap (Hardcopy + TTD)",
        rack_location: "Lemari Kurikulum A1-04"
      },
      review: {
        reviewer_name: "Sudarso, S.Pd.",
        reviewer_nip: "197609232008011006",
        reviewer_role: "Kepala SMK Negeri Wonosalam",
        review_date: "2025-09-06",
        total_score: 173,
        max_score: 188,
        percentage_score: 92,
        eligibility_category: "Sangat Layak",
        general_feedback: "Modul sangat inspiratif, mengintegrasikan kearifan lokal perkebunan kopi Wonosalam dengan prinsip Deep Learning (Mindful, Meaningful, Joyful) secara sangat harmonis. Rubrik HOTS dan lembar asesmen autentik tersusun prima.",
        recommendation: "Direkomendasikan sebagai modul percontohan (best practice) implementasi Kurikulum Merdeka Berbasis Pembelajaran Mendalam SMK Negeri Wonosalam.",
        due_revision_date: null,
        scores: {
          A1: 4, A2: 4, A3: 4, A4: 4, A5: 4,
          B1: 4, B2: 4, B3: 4, B4: 4, B5: 4,
          C1: 4, C2: 4, C3: 4, C4: 4, C5: 4,
          D1: 4, D2: 4, D3: 4, D4: 4, D5: 4,
          E1: 4, E2: 4, E3: 4, E4: 4, E5: 4,
          F1: 4, F2: 4, F3: 4, F4: 3, F5: 4,
          G1: 4, G2: 4, G3: 4, G4: 4, G5: 3, G6: 4,
          H1: 4, H2: 4, H3: 3, H4: 4, H5: 4, H6: 4,
          I1: 4, I2: 4, I3: 4, I4: 3, I5: 4
        }
      }
    },
    {
      id: "MOD-002",
      teacher_id: "USR-004",
      teacher_name: "Dewi Lestari, S.Pd., M.Par.",
      nip: "199011042018012004",
      department: "Kuliner",
      subject_name: "Inovasi Pengolahan Kuliner Nusantara & Buah Lokal",
      class_name: "XI Kuliner 1",
      phase: "Fase F",
      semester: "Ganjil",
      academic_year: "2025/2026",
      title: "Diversifikasi Pengolahan Durian & Salak Wonosalam Menjadi Pastry & Produk Bernilai Jual Tinggi",
      topic: "Pengolahan Hasil Hortikultura Lokal Menjadi Produk Bakery",
      learning_outcomes: "Peserta didik mampu mengkreasikan resep modifikasi pastry berbasis puree durian dan selai salak Wonosalam dengan standar keamanan pangan (HACCP) dan kalkulasi harga pokok penjualan.",
      learning_objectives: "1. Merancang formulasi adonan pastry dengan isian buah lokal. 2. Mempraktikkan pengolahan higienis. 3. Mengevaluasi respon pasar dan sensori organoleptik secara joyful.",
      file_name: "Modul_Kuliner_Diversifikasi_Wonosalam_Dewi.pdf",
      file_size: "4.1 MB",
      version_number: 1,
      status: "Needs Revision",
      submitted_at: "2025-09-08 10:15",
      reviewed_at: "2025-09-12 11:20",
      tendik_verification: {
        verified_by: "Tri Wahyuni, S.AP.",
        verified_at: "2025-09-13 14:00",
        archive_code: "ARSIP-2025/KLN/MOD-002",
        physical_status: "Perlu Revisi (Menunggu Pengumpulan Revisi)",
        rack_location: "Lemari Kurikulum B1-02"
      },
      review: {
        reviewer_name: "Sudarso, S.Pd.",
        reviewer_nip: "197609232008011006",
        reviewer_role: "Kepala SMK Negeri Wonosalam",
        review_date: "2025-09-12",
        total_score: 111,
        max_score: 188,
        percentage_score: 59,
        eligibility_category: "Perlu Revisi",
        general_feedback: "Topik sangat bagus dan kontekstual, namun instrumen asesmen formatif dan rubrik penilaian HOTS perlu dilengkapi sebelum implementasi di kelas.",
        recommendation: "Lengkapi lampiran rubrik uji organoleptik dan lembar refleksi diri siswa sebelum modul disahkan.",
        due_revision_date: "2025-10-10",
        scores: {
          A1: 3, A2: 3, A3: 2, A4: 2, A5: 3,
          B1: 3, B2: 2, B3: 3, B4: 2, B5: 2,
          C1: 2, C2: 3, C3: 2, C4: 2, C5: 2,
          D1: 3, D2: 2, D3: 2, D4: 3, D5: 3,
          E1: 3, E2: 3, E3: 2, E4: 2, E5: 3,
          F1: 2, F2: 2, F3: 2, F4: 2, F5: 2,
          G1: 2, G2: 2, G3: 2, G4: 2, G5: 2, G6: 2,
          H1: 2, H2: 3, H3: 2, H4: 3, H5: 2, H6: 2,
          I1: 2, I2: 2, I3: 2, I4: 2, I5: 3
        }
      }
    },
    {
      id: "MOD-003",
      teacher_id: "USR-005",
      teacher_name: "Ahmad Fauzi, S.T.",
      nip: "198903122019031008",
      department: "TKR",
      subject_name: "Pemeliharaan Mesin Kendaraan Ringan (EFI & Hybrid)",
      class_name: "XI TKR 1",
      phase: "Fase F",
      semester: "Ganjil",
      academic_year: "2025/2026",
      title: "Troubleshooting Sistem Injeksi Bahan Bakar Elektronik (EFI) & Sensor Oksigen pada Mesin Bensin",
      topic: "Diagnostik Malfungsi Sensor EFI Menggunakan Scan Tool OBD-II",
      learning_outcomes: "Peserta didik dapat menganalisis Diagnostic Trouble Code (DTC) pada sistem EFI kendaraan ringan dan melakukan prosedur perbaikan sesuai SOP industri otomotif.",
      learning_objectives: "1. Membaca data stream sensor TPS, MAP, dan O2. 2. Melakukan pelacakan kabel harness kelistrikan secara mindful. 3. Memperbaiki malfungsi dan menghapus DTC secara mandiri.",
      file_name: "Modul_TKR_EFI_AhmadFauzi.pdf",
      file_size: "2.8 MB",
      version_number: 1,
      status: "Pending Review",
      submitted_at: "2025-09-18 13:40",
      reviewed_at: null,
      tendik_verification: {
        verified_by: "Tri Wahyuni, S.AP.",
        verified_at: "2025-09-19 08:20",
        archive_code: "ARSIP-2025/TKR/MOD-003",
        physical_status: "Salinan Digital Diterima, Menunggu Telaah",
        rack_location: "Lemari Kurikulum C1-01"
      },
      review: null
    },
    {
      id: "MOD-004",
      teacher_id: "USR-006",
      teacher_name: "Joko Widodo, S.T.",
      nip: "199108192020011005",
      department: "TPM",
      subject_name: "Teknik Pemesinan Bubut & Frais CNC",
      class_name: "X TPM 1",
      phase: "Fase E",
      semester: "Ganjil",
      academic_year: "2025/2026",
      title: "Pemrograman & Pengoperasian Dasar Mesin Bubut CNC GSK-980TDb untuk Pembubutan Bertingkat",
      topic: "G-Code Koordinat Absolut & Inkremental pada Bubut Presisi",
      learning_outcomes: "Peserta didik memahami struktur program kode G & M serta mampu mengeksekusi simulasi dry-run sebelum pemotongan benda kerja aluminium.",
      learning_objectives: "1. Menyusun kode program G00, G01, G02, G03. 2. Melakukan setting zero point benda kerja. 3. Menginspeksi toleransi dimensi dengan mikrometer secara berkesadaran tinggi (Mindful).",
      file_name: "Modul_TPM_CNC_JokoWidodo.pdf",
      file_size: "5.2 MB",
      version_number: 1,
      status: "Appropriate with Revisions",
      submitted_at: "2025-09-24 16:00",
      reviewed_at: "2025-09-28 10:30",
      tendik_verification: {
        verified_by: "Tri Wahyuni, S.AP.",
        verified_at: "2025-09-25 10:15",
        archive_code: "ARSIP-2025/TPM/MOD-004",
        physical_status: "Dokumen Fisik Diserahkan ke Tata Usaha",
        rack_location: "Lemari Kurikulum D1-03"
      },
      review: {
        reviewer_name: "Drs. Bambang Supriyadi",
        reviewer_nip: "197105141998021003",
        reviewer_role: "Waka Kurikulum",
        review_date: "2025-09-28",
        total_score: 135,
        max_score: 188,
        percentage_score: 72,
        eligibility_category: "Layak dengan Revisi",
        general_feedback: "Alur pembelajaran bermakna sudah bagus, lengkapi lembar refleksi diri siswa dan keselamatan kerja mesin CNC.",
        recommendation: "Lengkapi SOP keselamatan kerja sebelum praktikum mandiri siswa.",
        due_revision_date: "2025-10-12",
        scores: {
          A1: 3, A2: 3, A3: 3, A4: 3, A5: 3,
          B1: 3, B2: 3, B3: 3, B4: 3, B5: 3,
          C1: 3, C2: 3, C3: 3, C4: 2, C5: 3,
          D1: 3, D2: 3, D3: 3, D4: 3, D5: 3,
          E1: 3, E2: 3, E3: 3, E4: 3, E5: 3,
          F1: 3, F2: 3, F3: 3, F4: 2, F5: 3,
          G1: 3, G2: 3, G3: 3, G4: 3, G5: 3, G6: 3,
          H1: 3, H2: 3, H3: 2, H4: 3, H5: 3, H6: 3,
          I1: 3, I2: 2, I3: 3, I4: 2, I5: 3
        }
      }
    },
    {
      id: "MOD-005",
      teacher_id: "USR-007",
      teacher_name: "Rudi Hermawan, S.Si.",
      nip: "199205182020011002",
      department: "Umum",
      subject_name: "Projek IPAS & Konservasi Wonosalam",
      class_name: "X ATP 1",
      phase: "Fase E",
      semester: "Ganjil",
      academic_year: "2025/2026",
      title: "Analisis Kualitas Air Sumber Pegunungan Anjasmoro dan Filtrasi Alami Berbasis Projek",
      topic: "Ekosistem Air dan Kelestarian Alam Wonosalam",
      learning_outcomes: "Peserta didik mampu melakukan uji parameter fisik-kimia air sumber desa dan merekayasa alat penjernih air sederhana dengan bahan lokal.",
      learning_objectives: "1. Mengukur pH dan kekeruhan air. 2. Merancang filter zeolite dan pasir silika. 3. Mempresentasikan solusi kelestarian mata air bagi warga desa Wonosalam.",
      file_name: "Modul_IPAS_Konservasi_RudiH.pdf",
      file_size: "3.1 MB",
      version_number: 1,
      status: "In Revision",
      submitted_at: "2025-09-14 09:10",
      reviewed_at: "2025-09-17 15:30",
      tendik_verification: {
        verified_by: "Tri Wahyuni, S.AP.",
        verified_at: "2025-09-18 11:00",
        archive_code: "ARSIP-2025/IPS/MOD-005",
        physical_status: "Perlu Revisi (Menunggu Pengumpulan Revisi)",
        rack_location: "Lemari Kurikulum E1-01"
      },
      review: {
        reviewer_name: "Sudarso, S.Pd.",
        reviewer_nip: "197609232008011006",
        reviewer_role: "Kepala SMK Negeri Wonosalam",
        review_date: "2025-09-17",
        total_score: 104,
        max_score: 188,
        percentage_score: 55,
        eligibility_category: "Perlu Revisi",
        general_feedback: "Materi teknis akuntansi/lingkungan lengkap, tetapi rancangan kegiatan mindful dan alokasi jam praktikum lapangan perlu direvisi.",
        recommendation: "Lengkapi lampiran lembar observasi sikap bernalar kritis (P5) dan rubrik penilaian kinerja penyaringan air sebelum disetujui untuk digunakan di kelas.",
        due_revision_date: "2025-10-05",
        scores: {
          A1: 3, A2: 2, A3: 2, A4: 2, A5: 2,
          B1: 2, B2: 2, B3: 3, B4: 2, B5: 2,
          C1: 2, C2: 2, C3: 2, C4: 2, C5: 2,
          D1: 3, D2: 2, D3: 2, D4: 3, D5: 3,
          E1: 2, E2: 2, E3: 2, E4: 2, E5: 2,
          F1: 2, F2: 2, F3: 2, F4: 2, F5: 2,
          G1: 2, G2: 2, G3: 2, G4: 2, G5: 2, G6: 2,
          H1: 2, H2: 2, H3: 2, H4: 2, H5: 2, H6: 2,
          I1: 2, I2: 2, I3: 2, I4: 2, I5: 2
        }
      }
    }
  ],

  notifications: [
    {
      id: "NOTIF-001",
      user_id: "USR-003",
      title_id: "Modul Diterima & Disetujui!",
      title_en: "Module Approved!",
      message_id: "Modul 'Teknik Budidaya & Pemangkasan Kopi' disetujui Kepala Sekolah (Sudarso, S.Pd.) dengan skor 92% (173/188) Sangat Layak.",
      message_en: "Your module has been approved by Principal Sudarso, S.Pd. with 92% (Highly Appropriate).",
      created_at: "2025-09-06 14:20",
      is_read: false,
      related_module_id: "MOD-001"
    },
    {
      id: "NOTIF-002",
      user_id: "USR-008",
      title_id: "Modul Siap Diarsipkan",
      title_en: "Module Ready for Archiving",
      message_id: "Modul MOD-001 telah disetujui pimpinan dan masuk ke Buku Kendali Tata Usaha untuk penomoran arsip.",
      message_en: "Module MOD-001 has been approved and registered into the administrative log book.",
      created_at: "2025-09-07 09:15",
      is_read: false,
      related_module_id: "MOD-001"
    },
    {
      id: "NOTIF-003",
      user_id: "USR-004",
      title_id: "Catatan Revisi Modul Kuliner",
      title_en: "Module Revision Feedback",
      message_id: "Modul MOD-002 membutuhkan revisi instrumen asesmen formatif (Skor 59% - 111/188).",
      message_en: "Module MOD-002 requires formative rubric revision before October 10, 2025.",
      created_at: "2025-09-12 11:30",
      is_read: false,
      related_module_id: "MOD-002"
    }
  ],

  auditLogs: [
    {
      id: "LOG-001",
      user_name: "Sudarso, S.Pd.",
      role: "principal",
      activity: "Persetujuan Telaah Modul",
      description: "Menyetujui Modul Ajar MOD-001 (Budi Santoso - ATP) skor 173 (Sangat Layak)",
      ip_address: "192.168.1.10",
      created_at: "2025-09-06 14:15"
    },
    {
      id: "LOG-002",
      user_name: "Tri Wahyuni, S.AP.",
      role: "tendik",
      activity: "Verifikasi Buku Kendali",
      description: "Menerbitkan kode arsip ARSIP-2025/ATP/MOD-001 dan memverifikasi dokumen fisik di Lemari A1-04",
      ip_address: "192.168.1.18",
      created_at: "2025-09-07 09:30"
    },
    {
      id: "LOG-003",
      user_name: "Drs. Bambang Supriyadi",
      role: "principal",
      activity: "Telaah Modul TPM",
      description: "Menyelesaikan evaluasi 47 indikator untuk MOD-004 (Joko Widodo - TPM)",
      ip_address: "192.168.1.14",
      created_at: "2025-09-28 10:30"
    },
    {
      id: "LOG-004",
      user_name: "Siti Rahmawati, S.Kom.",
      role: "admin",
      activity: "Standardisasi Sistem",
      description: "Sinkronisasi hak akses 4 tingkatan akun: Admin, Kepsek/Waka, Guru, Tendik",
      ip_address: "192.168.1.2",
      created_at: "2025-09-30 09:00"
    }
  ]
};
