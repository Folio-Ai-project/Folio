require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || "career_ai_secret_2026";
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
]);

/* ===========================
   CORS
=========================== */

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS 차단: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

/* ===========================
   DB 설정
=========================== */

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "career",
  password: process.env.DB_PASSWORD || "career1234",
  database: process.env.DB_NAME || "career_ai",
};

let pool;

async function initDB() {
  pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
  });

  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();

  console.log(
    `DB 연결 성공 (${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database})`
  );
}

/* ===========================
  JWT 인증 미들웨어
=========================== */

function auth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "토큰 없음" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (e) {
    return res.status(401).json({ error: "토큰 검증 실패" });
  }
}

/* ===========================
  Health Check
=========================== */

app.get("/", (req, res) => {
  res.send("Server Running");
});

/* ===========================
  회원가입
=========================== */

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "필수값 없음" });
    }

    const [rows] = await pool.query(
      "SELECT id FROM users WHERE email=?",
      [email]
    );

    if (rows.length > 0) {
      return res.status(409).json({ error: "이미 존재하는 이메일" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (email,password,name) VALUES (?,?,?)",
      [email, hashedPassword, name]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "서버 오류" });
  }
});

/* ===========================
  로그인
=========================== */

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email=?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "이메일 또는 비밀번호 오류" });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "이메일 또는 비밀번호 오류" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      ok: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "서버 오류" });
  }
});

/* ===========================
  내 프로필 조회
=========================== */

app.get("/api/profile/me", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await pool.query(
      "SELECT id,email,name,career,portfolioUrl,stacks FROM users WHERE id=?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "유저 없음" });
    }

    const user = rows[0];

    let stacks = [];

    try {
      stacks = user.stacks ? JSON.parse(user.stacks) : [];
    } catch {
      stacks = [];
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      career: user.career || "",
      portfolioUrl: user.portfolioUrl || "",
      stacks,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "서버 오류" });
  }
});

/* ===========================
  내 프로필 저장
=========================== */

app.put("/api/profile/me", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { name, career, portfolioUrl, stacks } = req.body;

    const stacksJson = JSON.stringify(stacks || []);

    await pool.query(
      `UPDATE users 
      SET name=?, career=?, portfolioUrl=?, stacks=? 
      WHERE id=?`,
      [name, career, portfolioUrl, stacksJson, userId]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "서버 오류" });
  }
});

/* ===========================
  서버 시작
=========================== */

initDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB 초기화 실패:", err);
    console.error(
      "현재 DB 설정:",
      `${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`
    );
  });
