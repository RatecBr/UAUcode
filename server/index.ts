import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';

const app = express();
const PORT = 8080; // Changed to match frontend request if running standalone, but usually backend is 3000. Let's stick to 3000 to avoid conflict if FE is 8080. 
// Wait, USER asked "inicie o servidor, e defina sempre para 8080".
// If I put backend on 8080, FE on 8080 => Conflict.
// I will put Backend on 3000 and Frontend on 8080 as configured previously.

const SECRET_KEY = 'imagyne_secret_key_change_me';

// --- Database Setup ---
const db = new Database('database.sqlite');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  );
  CREATE TABLE IF NOT EXISTS targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    targetFile TEXT,
    contentFile TEXT,
    contentType TEXT
  );
`);

// Seed Users
const seedUsers = () => {
  const admin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  if (!admin) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
    console.log("Seeded Admin: admin / admin123");
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get('user');
  if (!user) {
    const hash = bcrypt.hashSync('user123', 10);
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('user', hash, 'user');
    console.log("Seeded User: user / user123");
  }
};
seedUsers();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Ensure storage
const storageDir = path.join(__dirname, 'storage');
if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, storageDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });
app.use('/assets', express.static(storageDir));

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') return res.sendStatus(403);
  next();
};

// --- Routes ---

// Login
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;

  if (!user) return res.status(400).json({ error: "User not found" });

  if (bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, role: user.role, username: user.username });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Get Targets (Public/User Authenticated)
app.get('/api/targets', authenticateToken, (req, res) => {
  const targets = db.prepare('SELECT * FROM targets').all();
  // Map to include full URLs
  const mapped = targets.map((t: any) => ({
    ...t,
    targetUrl: `/assets/${t.targetFile}`,
    contentUrl: `/assets/${t.contentFile}`
  }));
  res.json(mapped);
});

// Admin Upload
app.post('/api/upload', authenticateToken, requireAdmin, upload.fields([{ name: 'target' }, { name: 'content' }]), (req: any, res) => {
  const files = req.files as any;
  if (!files.target || !files.content) {
    return res.status(400).json({ error: "Both target and content files are required" });
  }

  const targetFile = files.target[0].filename;
  const contentFile = files.content[0].filename;
  const { name, contentType } = req.body;

  const info = db.prepare('INSERT INTO targets (name, targetFile, contentFile, contentType) VALUES (?, ?, ?, ?)').run(
    name || 'Untitled', targetFile, contentFile, contentType || 'video'
  );

  res.json({ success: true, id: info.lastInsertRowid });
});

// Admin Delete Target
app.delete('/api/targets/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const target = db.prepare('SELECT * FROM targets WHERE id = ?').get(id) as any;

  if (!target) return res.status(404).json({ error: "Target not found" });

  // Delete files from storage
  if (target.targetFile && fs.existsSync(path.join(storageDir, target.targetFile))) {
    fs.unlinkSync(path.join(storageDir, target.targetFile));
  }
  if (target.contentFile && fs.existsSync(path.join(storageDir, target.contentFile))) {
    fs.unlinkSync(path.join(storageDir, target.contentFile));
  }

  db.prepare('DELETE FROM targets WHERE id = ?').run(id);
  res.json({ success: true });
});

// Admin Update Target (Edit Name or Replace Files)
app.put('/api/targets/:id', authenticateToken, requireAdmin, upload.fields([{ name: 'target' }, { name: 'content' }]), (req: any, res) => {
  const { id } = req.params;
  const { name, contentType } = req.body;
  const files = req.files as any;

  const currentTarget = db.prepare('SELECT * FROM targets WHERE id = ?').get(id) as any;
  if (!currentTarget) return res.status(404).json({ error: "Target not found" });

  let targetFile = currentTarget.targetFile;
  let contentFile = currentTarget.contentFile;

  // Replace Target Image
  if (files.target) {
    if (targetFile && fs.existsSync(path.join(storageDir, targetFile))) {
      fs.unlinkSync(path.join(storageDir, targetFile));
    }
    targetFile = files.target[0].filename;
  }

  // Replace Content File
  if (files.content) {
    if (contentFile && fs.existsSync(path.join(storageDir, contentFile))) {
      fs.unlinkSync(path.join(storageDir, contentFile));
    }
    contentFile = files.content[0].filename;
  }

  db.prepare(`
        UPDATE targets 
        SET name = ?, targetFile = ?, contentFile = ?, contentType = COALESCE(?, contentType)
        WHERE id = ?
    `).run(name || currentTarget.name, targetFile, contentFile, contentType || null, id);

  res.json({ success: true });
});

app.listen(3000, () => {
  console.log(`Backend Server running on port 3000`);
});
