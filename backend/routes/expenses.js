const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');

// create expense
router.post('/', auth, async (req, res) => {
  try {
    const { amount, category, date, description } = req.body;
    if (!amount || !category || !date) return res.status(400).json({ message: 'amount, category, date required' });

    const expense = new Expense({
      user: req.userId,
      amount,
      category,
      date: new Date(date),
      description: description || ''
    });
    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// get expenses (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { category, start, end, search, page = 1, limit = 1000 } = req.query;
    const filter = { user: new mongoose.Types.ObjectId(req.userId) };

    if (category) filter.category = category;
    if (start || end) {
      filter.date = {};
      if (start) filter.date.$gte = new Date(start);
      if (end) filter.date.$lte = new Date(end);
    }
    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    const expenses = await Expense.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// update expense
router.put('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if(!expense) return res.status(404).json({ message: 'Expense not found' });
    if(expense.user.toString() !== req.userId) return res.status(403).json({ message: 'Not authorized' });

    const { amount, category, date, description } = req.body;
    if (amount !== undefined) expense.amount = amount;
    if (category) expense.category = category;
    if (date) expense.date = new Date(date);
    if (description !== undefined) expense.description = description;

    await expense.save();
    res.json(expense);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if(!expense) return res.status(404).json({ message: 'Expense not found' });
    if(expense.user.toString() !== req.userId) return res.status(403).json({ message: 'Not authorized' });

    await expense.deleteOne();
    res.json({ message: 'Expense deleted' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;