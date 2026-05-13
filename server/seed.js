/**
 * Seed script — creates demo users, cases, and hearings
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Case = require('./models/Case');
const Hearing = require('./models/Hearing');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eportal_db';

const users = [
  { name: 'Admin User',       email: 'admin@eportal.in',  password: 'admin123',  role: 'admin' },
  { name: 'Justice R. Sharma',email: 'judge@eportal.in',  password: 'judge123',  role: 'judge' },
  { name: 'Adv. Priya Mehta', email: 'lawyer@eportal.in', password: 'lawyer123', role: 'lawyer', barRegistrationNo: 'BAR/2020/MH/001' },
  { name: 'Ravi Kumar',       email: 'user@eportal.in',   password: 'user123',   role: 'litigant' },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Case.deleteMany(), Hearing.deleteMany()]);
  console.log('🗑️  Cleared existing data');

  // Create users
  const createdUsers = await User.create(users);
  console.log('👥 Created', createdUsers.length, 'users');

  const admin  = createdUsers.find(u => u.role === 'admin');
  const judge  = createdUsers.find(u => u.role === 'judge');
  const lawyer = createdUsers.find(u => u.role === 'lawyer');

  // Create cases
  const casesData = [
    {
      title: 'Kumar vs State of Karnataka – Land Dispute',
      caseType: 'Civil', priority: 'High', status: 'Hearing Scheduled',
      filedBy: lawyer._id, assignedJudge: judge._id,
      petitioner: { name: 'Ravi Kumar', contact: '9876543210', address: 'Bangalore North' },
      respondent: { name: 'State of Karnataka', contact: '080-22345678', address: 'Vidhana Soudha, Bengaluru' },
      petitionerLawyer: lawyer._id,
      description: 'Dispute over 2 acres agricultural land in Yelahanka taluk.',
    },
    {
      title: 'Mehta Family vs Mehta Builders – Property Rights',
      caseType: 'Civil', priority: 'Medium', status: 'In Progress',
      filedBy: lawyer._id, assignedJudge: judge._id,
      petitioner: { name: 'Shalini Mehta', contact: '9988776655', address: 'Koramangala, Bengaluru' },
      respondent: { name: 'Mehta Builders Pvt. Ltd.', contact: '9900112233', address: 'MG Road, Bengaluru' },
      petitionerLawyer: lawyer._id,
      description: 'Illegal construction on jointly owned family property.',
    },
    {
      title: 'State vs Arjun Reddy – IPC Section 420',
      caseType: 'Criminal', priority: 'Urgent', status: 'Hearing Scheduled',
      filedBy: admin._id, assignedJudge: judge._id,
      petitioner: { name: 'State of Karnataka', contact: '080-22001100', address: 'Govt. Pleader Office' },
      respondent: { name: 'Arjun Reddy', contact: '9844332211', address: 'Whitefield, Bengaluru' },
      description: 'Cheating and fraud in financial transactions amounting to ₹45 lakhs.',
    },
    {
      title: 'Laxmi Devi vs Ramesh Rao – Maintenance Dispute',
      caseType: 'Family', priority: 'High', status: 'Registered',
      filedBy: lawyer._id, assignedJudge: judge._id,
      petitioner: { name: 'Laxmi Devi', contact: '9765432100', address: 'Rajajinagar, Bengaluru' },
      respondent: { name: 'Ramesh Rao', contact: '9654321000', address: 'Jayanagar, Bengaluru' },
      petitionerLawyer: lawyer._id,
      description: 'Application under Section 125 CrPC for maintenance allowance.',
    },
    {
      title: 'TechSoft Solutions vs Infovision Ltd. – Labour Dispute',
      caseType: 'Labour', priority: 'Medium', status: 'Under Review',
      filedBy: lawyer._id, assignedJudge: judge._id,
      petitioner: { name: 'TechSoft Employees Union', contact: '9900998877', address: 'Electronic City, Bengaluru' },
      respondent: { name: 'Infovision Ltd.', contact: '080-44556677', address: 'Outer Ring Road, Bengaluru' },
      description: 'Dispute over unpaid wages and wrongful termination of 12 employees.',
    },
    {
      title: 'Patel Traders vs Revenue Department – Tax Assessment',
      caseType: 'Revenue', priority: 'Low', status: 'Disposed',
      filedBy: lawyer._id, assignedJudge: judge._id,
      petitioner: { name: 'Patel Traders', contact: '9111222333', address: 'Commercial Street, Bengaluru' },
      respondent: { name: 'Revenue Department, GOK', contact: '080-22001122', address: 'Cubbon Park, Bengaluru' },
      description: 'Challenge to excess property tax assessment for commercial premises.',
    },
  ];

  const createdCases = [];
for (const c of casesData) {
  const created = await Case.create(c);
  createdCases.push(created);
}
  console.log('⚖️  Created', createdCases.length, 'cases');

  // Create hearings for first 3 cases
  const futureDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  };

  const hearingsData = [
    {
      case: createdCases[0]._id, judge: judge._id,
      hearingDate: futureDate(3), hearingTime: '10:30 AM',
      courtRoom: 'Court Hall 1', purpose: 'Evidence Presentation',
      status: 'Scheduled',
    },
    {
      case: createdCases[1]._id, judge: judge._id,
      hearingDate: futureDate(5), hearingTime: '02:00 PM',
      courtRoom: 'Court Hall 2', purpose: 'Arguments',
      status: 'Scheduled',
    },
    {
      case: createdCases[2]._id, judge: judge._id,
      hearingDate: futureDate(1), hearingTime: '11:00 AM',
      courtRoom: 'Court Hall 1', purpose: 'Bail Application Hearing',
      status: 'Scheduled',
    },
    {
      case: createdCases[0]._id, judge: judge._id,
      hearingDate: new Date(Date.now() - 10 * 86400000), hearingTime: '10:00 AM',
      courtRoom: 'Court Hall 1', purpose: 'First Hearing',
      status: 'Completed',
      outcome: 'Both parties present. Documents submitted. Next date fixed.',
    },
    {
      case: createdCases[3]._id, judge: judge._id,
      hearingDate: futureDate(7), hearingTime: '09:30 AM',
      courtRoom: 'Court Hall 3', purpose: 'Maintenance Assessment',
      status: 'Scheduled',
    },
  ];

  await Hearing.create(hearingsData);
  console.log('📅 Created', hearingsData.length, 'hearings');

  console.log('\n✅ Seed complete! Demo credentials:');
  console.log('   Admin:    admin@eportal.in   / admin123');
  console.log('   Judge:    judge@eportal.in   / judge123');
  console.log('   Lawyer:   lawyer@eportal.in  / lawyer123');
  console.log('   Litigant: user@eportal.in    / user123\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
