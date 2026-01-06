require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db.js");

// routes
const authRoutes = require("./routes/auth.js");
const expenseRoutes = require("./routes/expenses.js");
const incomeRoutes = require("./routes/incomes.js");
const reportsRoutes = require("./routes/reports.js");

const app = express();
connectDB();

// -------- MIDDLEWARE ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------- SAFE CORS FIX ----------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman / server-to-server
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS blocked: " + origin));
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

// preflight
app.options("*", cors());

// -------- STATIC ----------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------- ROUTES ----------
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/reports", reportsRoutes);

// -------- ROOT CHECK ----------
app.get("/", (req, res) =>
  res.json({
    ok: true,
    frontend: process.env.FRONTEND_URL,
    env: process.env.NODE_ENV || "dev",
  })
);

// -------- START SERVER ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
