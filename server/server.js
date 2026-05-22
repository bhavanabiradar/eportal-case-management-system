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
app.get('/api/clear-all', async (req, res) => {
  try {
    await mongoose.connection.db.dropDatabase();
    res.json({ success: true, message: 'Database cleared' });
  } catch(e) {
    res.json({ success: false, error: e.message });
  }
});
app.get('/api/seed-now', async (req, res) => {
  try {
    const User = require('./models/User');
    await User.deleteMany({});
    const users = [
      { name: 'Admin', email: 'admin@eportal.in', password: 'Admin@123', role: 'admin' },
      { name: 'Neelima Sharma', email: 'neelimasharma@eportal.in', password: 'Neelima@123', role: 'judge' },
      { name: 'Ananth Hegde', email: 'ananthhegde@eportal.in', password: 'Ananth@123', role: 'judge' },
      { name: 'Shekhar Nayak', email: 'shekharnayak@eportal.in', password: 'Shashwat@123', role: 'lawyer', barRegistrationNo: 'BAR/2021/KA/001' },
      { name: 'Ananya Patil', email: 'ananyapatil@eportal.in', password: 'Ananya@123', role: 'lawyer', barRegistrationNo: 'BAR/2020/KA/047' },
      { name: 'Rajesh R', email: 'rajeshr@eportal.in', password: 'Rajesh@123', role: 'lawyer', barRegistrationNo: 'BAR/2019/KA/112' },
      { name: 'Aarav Gupta', email: 'aaravgupta@eportal.in', password: 'Aarav@123', role: 'litigant' },
      { name: 'S Janaki', email: 'sjanaki@eportal.in', password: 'Janaki@123', role: 'litigant' },
      { name: 'Amit Ramesh', email: 'amitramesh@eportal.in', password: 'Amit@123', role: 'litigant' },
      { name: 'Priyanka Chatterjee', email: 'priyankachatterjee@eportal.in', password: 'Priyanka@123', role: 'litigant' },
      { name: 'Lakshmi Menon', email: 'lakshmimenon@eportal.in', password: 'Lakshmi@123', role: 'litigant' },
      { name: 'Thomas Varghese', email: 'thomasvarghese@eportal.in', password: 'Thomas@123', role: 'litigant' },
    ];
    for (const u of users) await User.create(u);
    res.json({ success: true, message: '12 users created', users: users.map(u => u.email) });
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
