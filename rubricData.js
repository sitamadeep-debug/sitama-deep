// SITAMA-DEEP 47-Indicator Deep Learning Review Rubric
// Berdasarkan Naskah Kepemimpinan GEMPITA 2026 - Sudarso, S.Pd. (SMK Negeri Wonosalam, Kab. Jombang)
// Total Indikator: 47 | Skala Penilaian: 1 - 4 | Skor Maksimal: 188 (47 x 4)

const rubricCategories = [
  {
    id: "A",
    name_id: "A. Identitas dan Kelengkapan Modul (5 Indikator)",
    name_en: "A. Module Identity & Completeness (5 Indicators)",
    indicators: [
      { id: "A1", name_id: "Identitas modul ajar (satuan pendidikan, mata pelajaran, kelas/fase, semester, tahun pelajaran) lengkap dan sesuai.", name_en: "Teaching module identity is complete and accurate." },
      { id: "A2", name_id: "Alokasi waktu dan jumlah pertemuan sesuai dengan kegiatan pembelajaran yang direncanakan.", name_en: "Time allocation and meeting schedule match planned activities." },
      { id: "A3", name_id: "Capaian Pembelajaran (CP) dan Tujuan Pembelajaran (TP) dirumuskan secara jelas dan terukur.", name_en: "Learning outcomes (CP) and objectives (TP) are clearly formulated and measurable." },
      { id: "A4", name_id: "Modul memuat perangkat asesmen (diagnostik, formatif, sumatif) yang relevan dengan TP.", name_en: "Module includes assessment instruments (diagnostic, formative, summative) relevant to TP." },
      { id: "A5", name_id: "Kelengkapan komponen modul sesuai standar satuan pendidikan SMK Negeri Wonosalam.", name_en: "Completeness of module components meets school standards." }
    ]
  },
  {
    id: "B",
    name_id: "B. Kesesuaian Tujuan Pembelajaran (5 Indikator)",
    name_en: "B. Alignment of Learning Objectives (5 Indicators)",
    indicators: [
      { id: "B1", name_id: "Tujuan pembelajaran selaras dengan capaian pembelajaran dan profil lulusan.", name_en: "Learning objectives align with learning outcomes and graduate profiles." },
      { id: "B2", name_id: "Tujuan pembelajaran mendorong kemampuan berpikir tingkat tinggi (HOTS).", name_en: "Objectives encourage higher-order thinking skills (HOTS)." },
      { id: "B3", name_id: "Tujuan pembelajaran relevan dengan kebutuhan, konteks, dan karakteristik peserta didik.", name_en: "Objectives are relevant to students' needs, context, and traits." },
      { id: "B4", name_id: "Tujuan pembelajaran terintegrasi dengan penguatan karakter dan nilai keimanan/ketakwaan.", name_en: "Objectives integrate character development, faith, and piety values." },
      { id: "B5", name_id: "Tujuan pembelajaran terukur, realistis, dan berorientasi pada kompetensi vokasi kejuruan.", name_en: "Objectives are measurable, realistic, and oriented to vocational competencies." }
    ]
  },
  {
    id: "C",
    name_id: "C. Pembelajaran Berkesadaran / Mindful Learning (5 Indikator)",
    name_en: "C. Mindful Learning (5 Indicators)",
    indicators: [
      { id: "C1", name_id: "Modul membantu peserta didik memahami tujuan dan manfaat pembelajaran.", name_en: "Module helps students understand learning purposes and benefits." },
      { id: "C2", name_id: "Modul memfasilitasi peserta didik untuk fokus, hadir utuh, dan terlibat aktif.", name_en: "Module facilitates students to focus, be fully present, and engage actively." },
      { id: "C3", name_id: "Modul menyediakan aktivitas refleksi awal, proses, dan akhir pembelajaran.", name_en: "Module provides reflection activities at beginning, process, and end." },
      { id: "C4", name_id: "Modul mendorong kesadaran diri, regulasi diri, dan metakognisi peserta didik.", name_en: "Module promotes self-awareness, self-regulation, and metacognition." },
      { id: "C5", name_id: "Modul memperhatikan kesiapan, minat, gaya belajar, dan kebutuhan khusus peserta didik.", name_en: "Module accommodates student readiness, interests, and diverse needs." }
    ]
  },
  {
    id: "D",
    name_id: "D. Pembelajaran Bermakna / Meaningful Learning (5 Indikator)",
    name_en: "D. Meaningful Learning (5 Indicators)",
    indicators: [
      { id: "D1", name_id: "Materi pembelajaran dikaitkan dengan konteks kehidupan nyata peserta didik dan kearifan lokal Wonosalam.", name_en: "Content connects with students' real lives and Wonosalam local context." },
      { id: "D2", name_id: "Aktivitas pembelajaran menghubungkan pengetahuan awal dengan pengetahuan baru secara terpadu.", name_en: "Activities connect prior knowledge to new understanding cohesively." },
      { id: "D3", name_id: "Modul mendorong pemahaman konsep secara mendalam, bukan hafalan dangkal.", name_en: "Module fosters deep conceptual mastery rather than rote memorization." },
      { id: "D4", name_id: "Modul memfasilitasi pemecahan masalah dan penerapan pengetahuan pada situasi baru.", name_en: "Module facilitates authentic problem solving in novel scenarios." },
      { id: "D5", name_id: "Modul memberikan pengalaman belajar yang relevan, kontekstual, dan aplikatif kejuruan.", name_en: "Module delivers relevant, contextual, and vocational applied learning." }
    ]
  },
  {
    id: "E",
    name_id: "E. Pembelajaran Menggembirakan / Joyful Learning (5 Indikator)",
    name_en: "E. Joyful Learning (5 Indicators)",
    indicators: [
      { id: "E1", name_id: "Aktivitas pembelajaran menarik, memotivasi, dan menumbuhkan rasa ingin tahu peserta didik.", name_en: "Activities are engaging, motivating, and inspire genuine curiosity." },
      { id: "E2", name_id: "Modul menciptakan suasana belajar yang positif, aman, dan menghargai perbedaan.", name_en: "Module creates a positive, psychologically safe, and inclusive climate." },
      { id: "E3", name_id: "Modul memuat variasi metode, media, sumber belajar, dan aktivitas praktikum interaktif.", name_en: "Module features diverse methods, multimedia, and hands-on activities." },
      { id: "E4", name_id: "Modul memberi ruang partisipasi aktif, kolaborasi, dan kebebasan berekspresi positif.", name_en: "Module offers ample room for active participation and self-expression." },
      { id: "E5", name_id: "Modul mendorong antusiasme, kegembiraan, dan kebanggaan dalam belajar karya vokasi.", name_en: "Module sparks enthusiasm, joy, and vocational pride in learning." }
    ]
  },
  {
    id: "F",
    name_id: "F. Strategi Pembelajaran (5 Indikator)",
    name_en: "F. Learning Strategies (5 Indicators)",
    indicators: [
      { id: "F1", name_id: "Model pembelajaran (PjBL, PBL, inkuiri, teaching factory) sesuai dengan karakteristik materi dan TP.", name_en: "Learning model (PjBL, PBL, inquiry, teaching factory) suits TP." },
      { id: "F2", name_id: "Metode pembelajaran mendorong keterlibatan aktif dan interaksi bermakna antarsiswa.", name_en: "Instructional methods promote active collaboration and dialogue." },
      { id: "F3", name_id: "Modul menerapkan pembelajaran kolaboratif dan berbasis masalah/proyek nyata di industri/lapangan.", name_en: "Module implements project/problem-based real-world industry tasks." },
      { id: "F4", name_id: "Modul memuat diferensiasi pembelajaran (konten, proses, produk) sesuai kebutuhan peserta didik.", name_en: "Module incorporates differentiated learning (content, process, product)." },
      { id: "F5", name_id: "Modul mendukung pemanfaatan teknologi digital untuk memperdalam pemahaman konsep.", name_en: "Module integrates meaningful digital technology to deepen concepts." }
    ]
  },
  {
    id: "G",
    name_id: "G. Asesmen Pembelajaran (6 Indikator)",
    name_en: "G. Learning Assessment (6 Indicators)",
    indicators: [
      { id: "G1", name_id: "Asesmen selaras dengan tujuan pembelajaran (TP) dan capaian pembelajaran (CP).", name_en: "Assessments align with learning goals and outcomes." },
      { id: "G2", name_id: "Modul memuat asesmen diagnostik untuk memetakan kesiapan awal dan minat belajar.", name_en: "Module includes diagnostic assessment to map student readiness." },
      { id: "G3", name_id: "Modul memuat asesmen formatif berkelanjutan untuk memantau proses belajar.", name_en: "Module includes ongoing formative assessments to guide learning." },
      { id: "G4", name_id: "Modul memuat asesmen sumatif untuk mengukur ketercapaian kompetensi di akhir lingkup materi.", name_en: "Module includes summative assessments to measure mastery." },
      { id: "G5", name_id: "Instrumen asesmen dan rubrik penilaian tersedia, terukur, jelas, dan dipahami peserta didik.", name_en: "Assessment rubrics are clear, measurable, and transparent." },
      { id: "G6", name_id: "Asesmen mendorong refleksi diri peserta didik, pemberian umpan balik konstruktif, dan perbaikan.", name_en: "Assessments drive student reflection and constructive feedback." }
    ]
  },
  {
    id: "H",
    name_id: "H. Penguatan Kompetensi Peserta Didik (6 Indikator)",
    name_en: "H. Student Competency Strengthening (6 Indicators)",
    indicators: [
      { id: "H1", name_id: "Modul mengembangkan penalaran kritis, analisis data, dan pemecahan masalah teknis.", name_en: "Module develops critical reasoning and problem solving." },
      { id: "H2", name_id: "Modul mengembangkan kreativitas, inovasi produk, dan daya cipta peserta didik.", name_en: "Module cultivates student creativity and technical innovation." },
      { id: "H3", name_id: "Modul mengembangkan kemampuan komunikasi lisan, tulisan, presentasi kerja, dan literasi teknis.", name_en: "Module fosters oral, written, and technical communication." },
      { id: "H4", name_id: "Modul mengembangkan kemampuan kolaborasi, kepemimpinan kerja tim, dan gotong royong.", name_en: "Module promotes teamwork, collaboration, and shared responsibility." },
      { id: "H5", name_id: "Modul mengembangkan kemandirian, etos kerja industri, keselamatan kerja, dan regulasi diri.", name_en: "Module builds independence, industrial work ethic, and safety awareness." },
      { id: "H6", name_id: "Modul menguatkan karakter integritas, keimanan, ketakwaan, kepedulian lingkungan, dan kewargaan global.", name_en: "Module strengthens integrity, faith, environmental care, and global citizenship." }
    ]
  },
  {
    id: "I",
    name_id: "I. Refleksi dan Tindak Lanjut (5 Indikator)",
    name_en: "I. Reflection & Follow-up (5 Indicators)",
    indicators: [
      { id: "I1", name_id: "Modul memuat lembar refleksi peserta didik terhadap proses, emosi, dan hasil pembelajaran.", name_en: "Module includes student reflection on process, mindset, and outcomes." },
      { id: "I2", name_id: "Modul memuat panduan refleksi pendidik terhadap efektivitas proses pembelajaran.", name_en: "Module includes teacher self-reflection guidelines." },
      { id: "I3", name_id: "Modul memuat rencana tindak lanjut berdasarkan hasil asesmen dan observasi kelas.", name_en: "Module details actionable follow-up from assessment results." },
      { id: "I4", name_id: "Modul memuat strategi pendampingan remedial dan program pengayaan terencana.", name_en: "Module outlines structured remedial and enrichment strategies." },
      { id: "I5", name_id: "Modul realistis, praktis, dan dapat diimplementasikan sesuai ketersediaan sarana SMKN Wonosalam.", name_en: "Module is realistic and implementable within school facilities." }
    ]
  }
];

// Helper: Calculate Total Score, Percentage, and Eligibility Category
// Total Indikator: 5 + 5 + 5 + 5 + 5 + 5 + 6 + 6 + 5 = 47 Indikator
// Skor Maksimal: 47 x 4 = 188
function calculateEligibility(scores) {
  let totalScore = 0;
  let totalCount = 0;
  
  rubricCategories.forEach(cat => {
    cat.indicators.forEach(ind => {
      totalCount++;
      const val = scores && scores[ind.id] !== undefined ? scores[ind.id] : 3;
      totalScore += parseInt(val, 10);
    });
  });
  
  const maxScore = totalCount * 4; // 47 * 4 = 188
  const percentage = Math.round((totalScore / maxScore) * 100);
  
  let categoryKey = "catAppropriate";
  let statusKey = "statusApproved";
  let badgeColor = "green";

  if (percentage >= 86) {
    categoryKey = "catHighlyAppropriate"; // Sangat Layak (86 - 100%)
    statusKey = "statusApproved";
    badgeColor = "emerald";
  } else if (percentage >= 76) {
    categoryKey = "catAppropriate"; // Layak (76 - 85%)
    statusKey = "statusApproved";
    badgeColor = "blue";
  } else if (percentage >= 61) {
    categoryKey = "catAppropriateWithRevisions"; // Layak dengan Revisi (61 - 75%)
    statusKey = "statusAppropriateWithRevisions";
    badgeColor = "purple";
  } else if (percentage >= 51) {
    categoryKey = "catNeedsRevision"; // Perlu Revisi (51 - 60%)
    statusKey = "statusNeedsRevision";
    badgeColor = "amber";
  } else {
    categoryKey = "catNotAppropriateYet"; // Belum Layak (0 - 50%)
    statusKey = "statusRejected";
    badgeColor = "rose";
  }
  
  return {
    totalScore,
    maxScore,
    percentage,
    categoryKey,
    statusKey,
    badgeColor
  };
}
