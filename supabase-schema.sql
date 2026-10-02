-- ==============================================================================
-- SITAMA-DEEP (SMK NEGERI WONOSALAM - GEMPITA 2026)
-- Supabase PostgreSQL Database Schema & Initial Seed Data
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DEPARTMENTS (KONSENTRASI KEAHLIAN SMKN WONOSALAM)
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(150) NOT NULL,
    head VARCHAR(150) NOT NULL,
    color VARCHAR(20) DEFAULT '#2563EB',
    icon VARCHAR(10) DEFAULT '📚',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USERS / PROFILES (4 LEVEL AKUN: ADMIN, KEPSEK/WAKA, GURU, TENDIK)
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    title_badge VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) DEFAULT 'password123',
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'principal', 'teacher', 'tendik')),
    nip VARCHAR(50),
    phone VARCHAR(30),
    status VARCHAR(20) DEFAULT 'Active',
    department VARCHAR(100),
    subject_name VARCHAR(150),
    language_preference VARCHAR(10) DEFAULT 'id',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ACADEMIC YEARS
CREATE TABLE IF NOT EXISTS academic_years (
    id VARCHAR(50) PRIMARY KEY,
    year_name VARCHAR(50) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SUBJECTS (MATA PELAJARAN)
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL,
    name_id VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CLASSES (ROMBEL KELAS)
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(50) PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL,
    phase VARCHAR(20) NOT NULL,
    level VARCHAR(10) NOT NULL,
    department VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MODULES (MODUL AJAR PEMBELAJARAN MENDALAM)
CREATE TABLE IF NOT EXISTS modules (
    id VARCHAR(50) PRIMARY KEY,
    teacher_id VARCHAR(50) REFERENCES profiles(id) ON DELETE SET NULL,
    teacher_name VARCHAR(150) NOT NULL,
    nip VARCHAR(50),
    department VARCHAR(50),
    subject_name VARCHAR(200) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    phase VARCHAR(20) DEFAULT 'Fase E',
    semester VARCHAR(20) DEFAULT 'Ganjil',
    academic_year VARCHAR(50) DEFAULT '2025/2026',
    title VARCHAR(300) NOT NULL,
    topic VARCHAR(300),
    learning_outcomes TEXT,
    learning_objectives TEXT,
    file_name VARCHAR(255),
    file_size VARCHAR(50),
    file_url TEXT,
    version_number INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'Pending Review',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. REVIEWS (TELAAH DIGITAL 47 INDIKATOR KEPALA SEKOLAH)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id VARCHAR(50) REFERENCES modules(id) ON DELETE CASCADE,
    reviewer_name VARCHAR(150) NOT NULL,
    reviewer_nip VARCHAR(50),
    reviewer_role VARCHAR(100) DEFAULT 'Kepala SMK Negeri Wonosalam',
    review_date DATE DEFAULT CURRENT_DATE,
    total_score INT NOT NULL, -- Maks 188
    max_score INT DEFAULT 188,
    percentage_score INT NOT NULL,
    eligibility_category VARCHAR(100) NOT NULL,
    general_feedback TEXT,
    recommendation TEXT,
    due_revision_date DATE,
    scores JSONB NOT NULL, -- Format: {"A1":4, "A2":4, ... "I5":4}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TENDIK VERIFICATIONS (BUKU KENDALI & ARSIP TATA USAHA)
CREATE TABLE IF NOT EXISTS tendik_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id VARCHAR(50) REFERENCES modules(id) ON DELETE CASCADE,
    verified_by VARCHAR(150) NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    archive_code VARCHAR(100) UNIQUE NOT NULL,
    physical_status VARCHAR(100) NOT NULL,
    rack_location VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES profiles(id) ON DELETE CASCADE,
    title_id VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    message_id TEXT NOT NULL,
    message_en TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    related_module_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL,
    activity VARCHAR(150) NOT NULL,
    description TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INITIAL SEED DATA (SELARAS DOKUMEN GEMPITA 2026 SUDARSO, S.PD.)
-- ==============================================================================

-- Seed Departments
INSERT INTO departments (id, code, name, head, color, icon) VALUES
('KOMP-ATP', 'ATP', 'Agribisnis Tanaman Perkebunan', 'Budi Santoso, S.Pd.', '#10B981', '🌱'),
('KOMP-KLN', 'Kuliner', 'Kuliner / Tata Boga', 'Dewi Lestari, S.Pd., M.Par.', '#F59E0B', '🍳'),
('KOMP-TKR', 'TKR', 'Teknik Kendaraan Ringan', 'Ahmad Fauzi, S.T.', '#3B82F6', '🚗'),
('KOMP-TPM', 'TPM', 'Teknik Pemesinan', 'Joko Widodo, S.T.', '#8B5CF6', '⚙️'),
('KOMP-UMM', 'Umum', 'Mata Pelajaran Umum & IPAS', 'Rudi Hermawan, S.Si.', '#06B6D4', '📚')
ON CONFLICT (id) DO NOTHING;

-- Seed Users / Profiles (4 Tingkatan Akun)
INSERT INTO profiles (id, name, title_badge, email, username, password_hash, role, nip, phone, status, department, subject_name) VALUES
('USR-001', 'Siti Rahmawati, S.Kom.', 'Administrator Sistem', 'admin@smknwonosalam.sch.id', 'admin', 'password123', 'admin', '198504122010012003', '081234567890', 'Active', 'Pengelola Sistem & IT', NULL),
('USR-002', 'Sudarso, S.Pd.', 'Kepala Sekolah', 'sudarso.kepsek@smknwonosalam.sch.id', 'kepsek', 'password123', 'principal', '197609232008011006', '+62 815-1594-0188', 'Active', 'Manajemen Sekolah', NULL),
('USR-002B', 'Drs. Bambang Supriyadi', 'Waka Kurikulum', 'waka.kurikulum@smknwonosalam.sch.id', 'waka_kurikulum', 'password123', 'principal', '197105141998021003', '081331234567', 'Active', 'Bidang Kurikulum & Pembelajaran', NULL),
('USR-003', 'Budi Santoso, S.Pd.', 'Guru ATP', 'budi.santoso@smknwonosalam.sch.id', 'guru_atp', 'password123', 'teacher', '198807212015021001', '085678901234', 'Active', 'ATP', 'Dasar Budidaya Tanaman Perkebunan (Kopi & Cengkeh)'),
('USR-004', 'Dewi Lestari, S.Pd., M.Par.', 'Guru Kuliner', 'dewi.lestari@smknwonosalam.sch.id', 'guru_kuliner', 'password123', 'teacher', '199011042018012004', '087812345678', 'Active', 'Kuliner', 'Inovasi Pengolahan Kuliner Nusantara & Buah Lokal'),
('USR-005', 'Ahmad Fauzi, S.T.', 'Guru TKR', 'ahmad.fauzi@smknwonosalam.sch.id', 'guru_tkr', 'password123', 'teacher', '198903122019031008', '082134567891', 'Active', 'TKR', 'Pemeliharaan Mesin Kendaraan Ringan (EFI & Hybrid)'),
('USR-006', 'Joko Widodo, S.T.', 'Guru TPM', 'joko.widodo@smknwonosalam.sch.id', 'guru_tpm', 'password123', 'teacher', '199108192020011005', '081987654321', 'Active', 'TPM', 'Teknik Pemesinan Bubut & Frais CNC'),
('USR-007', 'Rudi Hermawan, S.Si.', 'Guru IPAS', 'rudi.hermawan@smknwonosalam.sch.id', 'guru_ipas', 'password123', 'teacher', '199205182020011002', '082345678912', 'Active', 'Umum', 'Projek IPAS & Konservasi Wonosalam'),
('USR-008', 'Tri Wahyuni, S.AP.', 'Tata Usaha / Tendik', 'tri.wahyuni@smknwonosalam.sch.id', 'tendik_tu', 'password123', 'tendik', '198706152014032002', '081398765432', 'Active', 'Tata Usaha / Administrasi Kurikulum', 'Pengadministrasi Buku Kendali & Arsip Modul')
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Modules
INSERT INTO modules (id, teacher_id, teacher_name, nip, department, subject_name, class_name, phase, semester, academic_year, title, topic, learning_outcomes, learning_objectives, file_name, file_size, version_number, status, submitted_at, reviewed_at) VALUES
('MOD-001', 'USR-003', 'Budi Santoso, S.Pd.', '198807212015021001', 'ATP', 'Dasar Budidaya Tanaman Perkebunan (Kopi & Cengkeh)', 'X ATP 1', 'Fase E', 'Ganjil', '2025/2026', 'Teknik Budidaya & Pemangkasan Tanaman Kopi Robusta Wonosalam Berbasis Mindful Learning', 'Pemeliharaan dan Pemangkasan Bentuk Kopi Organik', 'Peserta didik mampu menerapkan teknik penanaman dan pemangkasan tanaman kopi secara terukur.', '1. Mengidentifikasi cabang produktif. 2. Melakukan pemangkasan bentuk secara higienis.', 'Modul_Ajar_ATP_Kopi_Wonosalam_BudiSantoso.pdf', '3.4 MB', 2, 'Approved', '2025-09-02 08:30', '2025-09-06 14:15'),
('MOD-002', 'USR-004', 'Dewi Lestari, S.Pd., M.Par.', '199011042018012004', 'Kuliner', 'Inovasi Pengolahan Kuliner Nusantara & Buah Lokal', 'XI Kuliner 1', 'Fase F', 'Ganjil', '2025/2026', 'Diversifikasi Pengolahan Durian & Salak Wonosalam Menjadi Pastry & Produk Bernilai Jual Tinggi', 'Pengolahan Hasil Hortikultura Lokal Menjadi Produk Bakery', 'Peserta didik mampu mengkreasikan resep modifikasi pastry berbasis puree durian.', '1. Merancang formulasi pastry. 2. Praktik pengolahan higienis. 3. Evaluasi organoleptik.', 'Modul_Kuliner_Diversifikasi_Wonosalam_Dewi.pdf', '4.1 MB', 1, 'Needs Revision', '2025-09-08 10:15', '2025-09-12 11:20'),
('MOD-003', 'USR-005', 'Ahmad Fauzi, S.T.', '198903122019031008', 'TKR', 'Pemeliharaan Mesin Kendaraan Ringan (EFI & Hybrid)', 'XI TKR 1', 'Fase F', 'Ganjil', '2025/2026', 'Troubleshooting Sistem Injeksi Bahan Bakar Elektronik (EFI) & Sensor Oksigen pada Mesin Bensin', 'Diagnostik Malfungsi Sensor EFI Menggunakan Scan Tool OBD-II', 'Peserta didik dapat menganalisis Diagnostic Trouble Code (DTC) pada sistem EFI kendaraan ringan.', '1. Membaca data sensor TPS dan MAP. 2. Pelacakan kabel harness kelistrikan mindful.', 'Modul_TKR_EFI_AhmadFauzi.pdf', '2.8 MB', 1, 'Pending Review', '2025-09-18 13:40', NULL),
('MOD-004', 'USR-006', 'Joko Widodo, S.T.', '199108192020011005', 'TPM', 'Teknik Pemesinan Bubut & Frais CNC', 'X TPM 1', 'Fase E', 'Ganjil', '2025/2026', 'Pemrograman & Pengoperasian Dasar Mesin Bubut CNC GSK-980TDb untuk Pembubutan Bertingkat', 'G-Code Koordinat Absolut & Inkremental pada Bubut Presisi', 'Peserta didik memahami struktur program kode G & M serta simulasi dry-run.', '1. Menyusun kode program G00-G03. 2. Setting zero point. 3. Menginspeksi toleransi dimensi.', 'Modul_TPM_CNC_JokoWidodo.pdf', '5.2 MB', 1, 'Appropriate with Revisions', '2025-09-24 16:00', '2025-09-28 10:30'),
('MOD-005', 'USR-007', 'Rudi Hermawan, S.Si.', '199205182020011002', 'Umum', 'Projek IPAS & Konservasi Wonosalam', 'X ATP 1', 'Fase E', 'Ganjil', '2025/2026', 'Analisis Kualitas Air Sumber Pegunungan Anjasmoro dan Filtrasi Alami Berbasis Projek', 'Ekosistem Air dan Kelestarian Alam Wonosalam', 'Peserta didik mampu melakukan uji parameter fisik-kimia air sumber desa.', '1. Mengukur pH dan kekeruhan air. 2. Merancang filter zeolit. 3. Presentasi kelestarian air.', 'Modul_IPAS_Konservasi_RudiH.pdf', '3.1 MB', 1, 'In Revision', '2025-09-14 09:10', '2025-09-17 15:30')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tendik_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow Public Read & Write for Demo/Intranet (Bisa diperketat sesuai kebutuhan Supabase Auth)
CREATE POLICY "Public Read All" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public Write All" ON profiles FOR ALL USING (true);
CREATE POLICY "Public Read Modules" ON modules FOR SELECT USING (true);
CREATE POLICY "Public Write Modules" ON modules FOR ALL USING (true);
CREATE POLICY "Public Read Reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public Write Reviews" ON reviews FOR ALL USING (true);
CREATE POLICY "Public Read Tendik" ON tendik_verifications FOR SELECT USING (true);
CREATE POLICY "Public Write Tendik" ON tendik_verifications FOR ALL USING (true);
CREATE POLICY "Public Read Notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Public Write Notifications" ON notifications FOR ALL USING (true);
CREATE POLICY "Public Read Audit" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Public Write Audit" ON audit_logs FOR ALL USING (true);
