const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded documents
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/cases',     require('./routes/cases'));
app.use('/api/hearings',  require('./routes/hearings'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/seed-now', async (req, res) => {
  try {
    const User = require('./models/User');
    const existing = await User.findOne({ email: 'admin@eportal.in' });
    if (existing) return res.json({ message: 'Already seeded', user: existing.email });
    await User.create({ name: 'Admin User', email: 'admin@eportal.in', password: 'admin123', role: 'admin' });
    await User.create({ name: 'Justice R. Sharma', email: 'judge@eportal.in', password: 'judge123', role: 'judge' });
    await User.create({ name: 'Adv. Priya Mehta', email: 'lawyer@eportal.in', password: 'lawyer123', role: 'lawyer' });
    await User.create({ name: 'Ravi Kumar', email: 'user@eportal.in', password: 'user123', role: 'litigant' });
    res.json({ success: true, message: '4 users created' });
  } catch(e) {
    res.json({ success: false, error: e.message });
  }
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── Database + Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eportal_db';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
