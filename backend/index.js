require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db.js');

const authRoutes = require('./routes/auth.js');
const expenseRoutes = require('./routes/expenses.js');
const incomeRoutes = require('./routes/income.js');
const reportsRoutes = require('./routes/reports.js');

const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.CLIENT_URL || '*'
}));

// serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes
app.use('/api/auth', authRoutes); 
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/reports', reportsRoutes);

// health check
app.get('/', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'dev' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));