const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const { parse } = require('json2csv');

// category aggregation for expenses
router.get('/expenses-by-category', auth, async (req, res) => {
  try {
    const results = await Expense.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.userId) } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);
    // transform to { name, total }
    res.json(results.map(r => ({ category: r._id, total: r.total })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// monthly timeline for expenses (year-month)
router.get('/expenses-timeline', auth, async (req, res) => {
  try {
    const timeline = await Expense.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.userId) } },
      { $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amount' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: { _id: 0, year: '$_id.year', month: '$_id.month', total: 1 } }
    ]);
    res.json(timeline);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// dashboard summary (totals)
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.userId);
    const [expenseTotalAggregate] = await Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const [incomeTotalAggregate] = await Income.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    res.json({
      totalExpenses: expenseTotalAggregate ? expenseTotalAggregate.total : 0,
      totalIncomes: incomeTotalAggregate ? incomeTotalAggregate.total : 0,
      balance: (incomeTotalAggregate ? incomeTotalAggregate.total : 0) - (expenseTotalAggregate ? expenseTotalAggregate.total : 0)
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// download expense CSV
router.get('/download/expenses', auth, async (req, res) => {
  try {
    const { start, end } = req.query;
    const filter = { user: mongoose.Types.ObjectId(req.userId) };
    if (start || end) {
      filter.date = {};
      if (start) filter.date.$gte = new Date(start);
      if (end) filter.date.$lte = new Date(end);
    }
    const rows = await Expense.find(filter).sort({ date: -1 });
    const data = rows.map(r => ({
      id: r._id.toString(),
      amount: r.amount,
      category: r.category,
      date: r.date.toISOString(),
      description: r.description
    }));
    const csv = parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment('expenses.csv');
    res.send(csv);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// download incomes CSV
router.get('/download/incomes', auth, async (req, res) => {
  try {
    const { start, end } = req.query;
    const filter = { user: mongoose.Types.ObjectId(req.userId) };
    if (start || end) {
      filter.date = {};
      if (start) filter.date.$gte = new Date(start);
      if (end) filter.date.$lte = new Date(end);
    }
    const rows = await Income.find(filter).sort({ date: -1 });
    const data = rows.map(r => ({
      id: r._id.toString(),
      amount: r.amount,
      source: r.source,
      date: r.date.toISOString(),
      description: r.description
    }));
    const csv = parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment('incomes.csv');
    res.send(csv);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;