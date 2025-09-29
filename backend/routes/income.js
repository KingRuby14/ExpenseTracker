const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // <-- Make sure this is here
const auth = require('../middleware/auth');
const Income = require('../models/Income');

// CREATE income
router.post('/', auth, async (req, res) => {
  try {
    const { amount, source, date, description } = req.body;
    if (!amount || !source || !date) {
      return res.status(400).json({ message: 'amount, source, date required' });
    }

    const income = new Income({
      user: req.userId,
      amount,
      source,
      date: new Date(date),
      description: description || ''
    });

    await income.save();
    res.json(income);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET incomes
router.get('/', auth, async (req, res) => {
  try {
    const { source, start, end, search, page = 1, limit = 1000 } = req.query;

    const filter = { user: req.userId };

    if (source) filter.source = source;
    if (start || end) {
      filter.date = {};
      if (start) filter.date.$gte = new Date(start);
      if (end) filter.date.$lte = new Date(end);
    }
    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    const incomes = await Income.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json(incomes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE income
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid income ID' });
    }

    const income = await Income.findById(id);
    if (!income) return res.status(404).json({ message: 'Income not found' });
    if (income.user.toString() !== req.userId) return res.status(403).json({ message: 'Not authorized' });

    const { amount, source, date, description } = req.body;
    if (amount !== undefined) income.amount = amount;
    if (source) income.source = source;
    if (date) income.date = new Date(date);
    if (description !== undefined) income.description = description;

    await income.save();
    res.json(income);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE income
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid income ID' });
    }

    const income = await Income.findById(id);
    if (!income) return res.status(404).json({ message: 'Income not found' });
    if (income.user.toString() !== req.userId) return res.status(403).json({ message: 'Not authorized' });

    await Income.deleteOne({ _id: id });
    res.json({ message: 'Income deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
