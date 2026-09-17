import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'database.sqlite');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for better performance
db.exec('PRAGMA journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY DEFAULT 1,
    name TEXT DEFAULT 'Hafidz',
    title TEXT DEFAULT 'Full Stack Developer',
    subtitle TEXT DEFAULT 'Crafting Digital Experiences',
    bio TEXT DEFAULT 'Seorang developer yang passionate dalam membangun aplikasi web modern dan interaktif. Dengan pengalaman di berbagai teknologi, saya selalu berusaha menciptakan solusi digital yang elegan dan efisien.',
    photo TEXT DEFAULT '',
    cv_file TEXT DEFAULT '',
    email TEXT DEFAULT 'hafidz@example.com'
  );

  CREATE TABLE IF NOT EXISTS portfolio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL CHECK(category IN ('project', 'certificate', 'techstack')),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    detail TEXT DEFAULT '',
    image TEXT DEFAULT '',
    tech_used TEXT DEFAULT '',
    duration TEXT DEFAULT '',
    site_url TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS experience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    institution TEXT DEFAULT '',
    period TEXT DEFAULT '',
    description TEXT DEFAULT '',
    type TEXT DEFAULT 'education',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    avatar_color TEXT DEFAULT '#6366f1',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_approved INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default data if tables are empty
function seedData() {
  const profileCount = db.prepare('SELECT COUNT(*) as count FROM profile').get();
  if (profileCount.count === 0) {
    db.prepare(`INSERT INTO profile (id, name, title, subtitle, bio, email) VALUES (1, 'Hafidz', 'Full Stack Developer', 'Crafting Digital Experiences', 'Seorang developer yang passionate dalam membangun aplikasi web modern dan interaktif. Dengan pengalaman di berbagai teknologi, saya selalu berusaha menciptakan solusi digital yang elegan dan efisien.', 'hafidz@example.com')`).run();
  }

  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
  if (adminCount.count === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO admin_users (username, password) VALUES (?, ?)').run('admin', hashedPassword);
  }

  const socialCount = db.prepare('SELECT COUNT(*) as count FROM social_links').get();
  if (socialCount.count === 0) {
    const socialInsert = db.prepare('INSERT INTO social_links (platform, url, icon, sort_order) VALUES (?, ?, ?, ?)');
    socialInsert.run('github', 'https://github.com/hafidz', 'github', 1);
    socialInsert.run('instagram', 'https://instagram.com/hafidz', 'instagram', 2);
    socialInsert.run('tiktok', 'https://tiktok.com/@hafidz', 'tiktok', 3);
    socialInsert.run('linkedin', 'https://linkedin.com/in/hafidz', 'linkedin', 4);
    socialInsert.run('twitter', 'https://twitter.com/hafidz', 'twitter', 5);
  }

  const portfolioCount = db.prepare('SELECT COUNT(*) as count FROM portfolio').get();
  if (portfolioCount.count === 0) {
    const portfolioInsert = db.prepare('INSERT INTO portfolio (category, title, description, detail, tech_used, duration, site_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    portfolioInsert.run('project', 'E-Commerce Platform', 'Platform e-commerce modern dengan fitur real-time', 'Membangun platform e-commerce full-stack dengan fitur keranjang belanja, payment gateway, dan real-time inventory tracking. Menggunakan arsitektur microservices untuk skalabilitas.', 'React, Node.js, MongoDB, Stripe', '3 bulan', 'https://example.com', 1);
    portfolioInsert.run('project', 'Task Management App', 'Aplikasi manajemen tugas dengan kolaborasi tim', 'Aplikasi manajemen proyek dengan fitur drag-and-drop kanban board, real-time collaboration, dan notifikasi. Terintegrasi dengan Slack dan Google Calendar.', 'Vue.js, Express, PostgreSQL, Socket.io', '2 bulan', 'https://example.com', 2);
    portfolioInsert.run('project', 'AI Chat Assistant', 'Chatbot AI dengan NLP untuk customer service', 'Chatbot pintar menggunakan natural language processing untuk otomasi customer service. Mampu menangani 80% pertanyaan umum secara otomatis.', 'Python, TensorFlow, FastAPI, React', '4 bulan', 'https://example.com', 3);
    portfolioInsert.run('certificate', 'Universitas Teknologi', 'S1 Teknik Informatika', 'Menyelesaikan program sarjana dengan fokus pada pengembangan perangkat lunak dan kecerdasan buatan. Aktif dalam berbagai proyek riset dan kompetisi programming.', 'Java, Python, C++, SQL', '4 tahun', '', 1);
    portfolioInsert.run('certificate', 'Bootcamp Full Stack', 'Intensive Full Stack Web Development', 'Program intensif 6 bulan yang mencakup frontend, backend, dan DevOps. Menyelesaikan 15+ proyek real-world.', 'JavaScript, React, Node.js, Docker', '6 bulan', '', 2);
    portfolioInsert.run('techstack', 'JavaScript / TypeScript', 'Bahasa pemrograman utama', 'Pengalaman 3+ tahun menggunakan JavaScript dan TypeScript untuk pengembangan web full-stack.', '', '3+ tahun', '', 1);
    portfolioInsert.run('techstack', 'React & Next.js', 'Frontend Framework', 'Membangun UI interaktif dan performant menggunakan React ecosystem termasuk Redux, React Query, dan Next.js.', '', '2+ tahun', '', 2);
    portfolioInsert.run('techstack', 'Node.js & Express', 'Backend Runtime', 'Mengembangkan RESTful API dan microservices menggunakan Node.js dengan Express dan Fastify.', '', '3+ tahun', '', 3);
    portfolioInsert.run('techstack', 'Python', 'AI & Backend', 'Pengalaman dengan Django, FastAPI, dan library machine learning seperti TensorFlow dan PyTorch.', '', '2+ tahun', '', 4);
    portfolioInsert.run('techstack', 'Database', 'SQL & NoSQL', 'Pengalaman dengan PostgreSQL, MySQL, MongoDB, dan Redis untuk berbagai kebutuhan data storage.', '', '3+ tahun', '', 5);
    portfolioInsert.run('techstack', 'DevOps & Cloud', 'Infrastructure', 'Docker, CI/CD pipelines, AWS, dan Vercel untuk deployment dan infrastructure management.', '', '2+ tahun', '', 6);
  }

  const expCount = db.prepare('SELECT COUNT(*) as count FROM experience').get();
  if (expCount.count === 0) {
    const expInsert = db.prepare('INSERT INTO experience (title, institution, period, description, type, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    expInsert.run('SD Negeri 1', 'Sekolah Dasar', '2008 - 2014', 'Menempuh pendidikan dasar dan mulai mengenal teknologi komputer.', 'education', 1);
    expInsert.run('SMP Negeri 1', 'Sekolah Menengah Pertama', '2014 - 2017', 'Mulai mengenal programming dasar dan membuat website sederhana.', 'education', 2);
    expInsert.run('SMA Negeri 1', 'Sekolah Menengah Atas', '2017 - 2020', 'Fokus pada jurusan IPA dan aktif dalam ekskul komputer serta robotika.', 'education', 3);
    expInsert.run('Universitas Teknologi', 'S1 Teknik Informatika', '2020 - 2024', 'Mendalami ilmu komputer, algoritma, dan pengembangan perangkat lunak. Aktif dalam berbagai proyek riset.', 'education', 4);
    expInsert.run('Junior Developer', 'Tech Startup', '2023 - 2024', 'Magang sebagai junior developer, membangun fitur-fitur baru untuk platform utama perusahaan.', 'work', 5);
    expInsert.run('Full Stack Developer', 'Freelance', '2024 - Sekarang', 'Mengerjakan berbagai proyek freelance untuk klien lokal dan internasional.', 'work', 6);
  }

  const commentCount = db.prepare('SELECT COUNT(*) as count FROM comments').get();
  if (commentCount.count === 0) {
    const commentInsert = db.prepare('INSERT INTO comments (name, message, avatar_color) VALUES (?, ?, ?)');
    commentInsert.run('Budi Santoso', 'Portfolio yang sangat impressive! Liquid glass effectnya keren banget 🔥', '#6366f1');
    commentInsert.run('Sari Dewi', 'Desainnya profesional sekali, semoga sukses terus ya!', '#ec4899');
    commentInsert.run('Ahmad Rizky', 'Wow, interaktif banget websitenya. Inspiring! 💯', '#10b981');
  }
}

seedData();

export default db;
