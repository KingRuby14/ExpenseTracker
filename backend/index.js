// // -------- SAFE CORS FIX ----------
// const allowedOrigins = [
//   "https://expensestra.selvapandi.com",
//   "https://expense-tracker-qksg.onrender.com",
//   "http://localhost:5173",
//   "http://localhost:3000"
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin) return callback(null, true); // Postman / server-to-server
//       if (allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }
//       console.log("❌ CORS Blocked:", origin);
//       return callback(new Error("Not allowed by CORS"));
//     },

//     credentials: true,

//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

//     allowedHeaders: [
//       "Origin",
//       "X-Requested-With",
//       "Content-Type",
//       "Accept",
//       "Authorization",
//       "Cache-Control",
//       "Pragma",
//       "Expires",
//     ],
//   })
// );

// // preflight
// app.options("*", cors());






require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db.js');

// routes
const authRoutes = require('./routes/auth.js');
const expenseRoutes = require('./routes/expenses.js');
const incomeRoutes = require('./routes/incomes.js');
const reportsRoutes = require('./routes/reports.js');

const app = express();
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
const allowedOrigins = [
  'http://localhost:5173', // dev frontend
  process.env.CLIENT_URL   // Netlify frontend
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true,
}));

// serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/reports', reportsRoutes);

app.get('/', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'dev' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
