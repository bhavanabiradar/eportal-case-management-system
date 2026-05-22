/**
 * Seed script — real users, realistic cases and hearings
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Case     = require('./models/Case');
const Hearing  = require('./models/Hearing');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eportal_db';

const users = [
  // Admin
  { name: 'Admin', email: 'admin@eportal.in', password: 'Admin@123', role: 'admin' },

  // Judges
  { name: 'Neelima Sharma', email: 'neelimasharma@eportal.in', password: 'Neelima@123', role: 'judge' },
  { name: 'Ananth Hegde',   email: 'ananthhegde@eportal.in',   password: 'Ananth@123',  role: 'judge' },

  // Lawyers
  { name: 'Shekhar Nayak', email: 'shekharnayak@eportal.in', password: 'Shashwat@123', role: 'lawyer', barRegistrationNo: 'BAR/2021/KA/001' },
  { name: 'Ananya Patil',  email: 'ananyapatil@eportal.in',  password: 'Ananya@123',   role: 'lawyer', barRegistrationNo: 'BAR/2020/KA/047' },
  { name: 'Rajesh R',      email: 'rajeshr@eportal.in',      password: 'Rajesh@123',   role: 'lawyer', barRegistrationNo: 'BAR/2019/KA/112' },

  // Litigants
  { name: 'Aarav Gupta',          email: 'aaravgupta@eportal.in',          password: 'Aarav@123',    role: 'litigant' },
  { name: 'S Janaki',             email: 'sjanaki@eportal.in',             password: 'Janaki@123',   role: 'litigant' },
  { name: 'Amit Ramesh',          email: 'amitramesh@eportal.in',          password: 'Amit@123',     role: 'litigant' },
  { name: 'Priyanka Chatterjee',  email: 'priyankachatterjee@eportal.in',  password: 'Priyanka@123', role: 'litigant' },
  { name: 'Lakshmi Menon',        email: 'lakshmimenon@eportal.in',        password: 'Lakshmi@123',  role: 'litigant' },
  { name: 'Thomas Varghese',      email: 'thomasvarghese@eportal.in',      password: 'Thomas@123',   role: 'litigant' },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  await Promise.all([User.deleteMany(), Case.deleteMany(), Hearing.deleteMany()]);
  console.log('🗑️  Cleared existing data');

  // Create users one at a time so passwords hash correctly
  const created = [];
  for (const u of users) {
    const doc = await User.create(u);
    created.push(doc);
  }
  console.log('👥 Created', created.length, 'users');

  const admin    = created.find(u => u.role === 'admin');
  const judge1   = created.find(u => u.name === 'Neelima Sharma');
  const judge2   = created.find(u => u.name === 'Ananth Hegde');
  const lawyer1  = created.find(u => u.name === 'Shekhar Nayak');
  const lawyer2  = created.find(u => u.name === 'Ananya Patil');
  const lawyer3  = created.find(u => u.name === 'Rajesh R');
  const aarav    = created.find(u => u.name === 'Aarav Gupta');
  const janaki   = created.find(u => u.name === 'S Janaki');
  const amit     = created.find(u => u.name === 'Amit Ramesh');
  const priyanka = created.find(u => u.name === 'Priyanka Chatterjee');
  const lakshmi  = created.find(u => u.name === 'Lakshmi Menon');
  const thomas   = created.find(u => u.name === 'Thomas Varghese');

  const casesData = [
    {
      title: 'Aarav Gupta vs State of Karnataka – Land Dispute',
      caseType: 'Civil', priority: 'High', status: 'Hearing Scheduled',
      filedBy: lawyer1._id, assignedJudge: judge1._id,
      petitionerUser: aarav._id,
      petitioner: { name: 'Aarav Gupta', contact: '9876543210', address: 'Indiranagar, Bengaluru - 560038' },
      respondent: { name: 'State of Karnataka', contact: '080-22345678', address: 'Vidhana Soudha, Bengaluru' },
      petitionerLawyer: lawyer1._id,
      description: 'Dispute over 2 acres of agricultural land in Yelahanka taluk. Petitioner claims ancestral ownership.',
    },
    {
      title: 'S Janaki vs Ramesh Constructions – Property Rights',
      caseType: 'Civil', priority: 'Medium', status: 'In Progress',
      filedBy: lawyer2._id, assignedJudge: judge1._id,
      petitionerUser: janaki._id,
      petitioner: { name: 'S Janaki', contact: '9988776655', address: 'Koramangala, Bengaluru - 560034' },
      respondent: { name: 'Ramesh Constructions Pvt. Ltd.', contact: '9900112233', address: 'MG Road, Bengaluru' },
      petitionerLawyer: lawyer2._id,
      description: 'Illegal construction encroaching on jointly owned residential property.',
    },
    {
      title: 'State of Karnataka vs Amit Ramesh – IPC Section 420',
      caseType: 'Criminal', priority: 'Urgent', status: 'Hearing Scheduled',
      filedBy: admin._id, assignedJudge: judge2._id,
      respondentUser: amit._id,
      petitioner: { name: 'State of Karnataka', contact: '080-22001100', address: 'Government Pleader\'s Office, Bengaluru' },
      respondent: { name: 'Amit Ramesh', contact: '9844332211', address: 'Whitefield, Bengaluru - 560066' },
      respondentLawyer: lawyer3._id,
      description: 'Cheating and fraud in financial transactions amounting to ₹45 lakhs.',
    },
    {
      title: 'Priyanka Chatterjee vs Vikram Chatterjee – Maintenance',
      caseType: 'Family', priority: 'High', status: 'Registered',
      filedBy: lawyer1._id, assignedJudge: judge1._id,
      petitionerUser: priyanka._id,
      petitioner: { name: 'Priyanka Chatterjee', contact: '9765432100', address: 'Rajajinagar, Bengaluru - 560010' },
      respondent: { name: 'Vikram Chatterjee', contact: '9654321000', address: 'Jayanagar, Bengaluru - 560041' },
      petitionerLawyer: lawyer1._id,
      description: 'Application under Section 125 CrPC for monthly maintenance allowance.',
    },
    {
      title: 'Lakshmi Menon vs InfoTech Solutions – Wrongful Termination',
      caseType: 'Labour', priority: 'Medium', status: 'Under Review',
      filedBy: lawyer2._id, assignedJudge: judge2._id,
      petitionerUser: lakshmi._id,
      petitioner: { name: 'Lakshmi Menon', contact: '9900998877', address: 'Electronic City, Bengaluru - 560100' },
      respondent: { name: 'InfoTech Solutions Ltd.', contact: '080-44556677', address: 'Outer Ring Road, Bengaluru' },
      petitionerLawyer: lawyer2._id,
      respondentLawyer: lawyer3._id,
      description: 'Dispute over wrongful termination and unpaid dues amounting to ₹3.2 lakhs.',
    },
    {
      title: 'Thomas Varghese vs Revenue Department – Tax Assessment',
      caseType: 'Revenue', priority: 'Low', status: 'Disposed',
      filedBy: lawyer3._id, assignedJudge: judge1._id,
      petitionerUser: thomas._id,
      petitioner: { name: 'Thomas Varghese', contact: '9111222333', address: 'Commercial Street, Bengaluru - 560001' },
      respondent: { name: 'Revenue Department, GOK', contact: '080-22001122', address: 'Cubbon Park, Bengaluru' },
      petitionerLawyer: lawyer3._id,
      description: 'Challenge to excess property tax assessment for commercial premises.',
    },
  ];

  const createdCases = [];
  for (const c of casesData) {
    const doc = await Case.create(c);
    createdCases.push(doc);
  }
  console.log('⚖️  Created', createdCases.length, 'cases');

  const future = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d; };
  const past   = (days) => { const d = new Date(); d.setDate(d.getDate() - days); return d; };

  const hearingsData = [
    {
      case: createdCases[0]._id, judge: judge1._id,
      hearingDate: future(3), hearingTime: '10:30 AM',
      courtRoom: 'Court Hall 1', purpose: 'Evidence Presentation', status: 'Scheduled',
    },
    {
      case: createdCases[1]._id, judge: judge1._id,
      hearingDate: future(5), hearingTime: '02:00 PM',
      courtRoom: 'Court Hall 2', purpose: 'Arguments', status: 'Scheduled',
    },
    {
      case: createdCases[2]._id, judge: judge2._id,
      hearingDate: future(1), hearingTime: '11:00 AM',
      courtRoom: 'Court Hall 3', purpose: 'Bail Application Hearing', status: 'Scheduled',
    },
    {
      case: createdCases[0]._id, judge: judge1._id,
      hearingDate: past(10), hearingTime: '10:00 AM',
      courtRoom: 'Court Hall 1', purpose: 'First Hearing', status: 'Completed',
      outcome: 'Both parties present. Documents submitted. Next date fixed.',
    },
    {
      case: createdCases[3]._id, judge: judge1._id,
      hearingDate: future(7), hearingTime: '09:30 AM',
      courtRoom: 'Court Hall 2', purpose: 'Maintenance Assessment', status: 'Scheduled',
    },
    {
      case: createdCases[4]._id, judge: judge2._id,
      hearingDate: future(4), hearingTime: '03:00 PM',
      courtRoom: 'Court Hall 1', purpose: 'First Hearing', status: 'Scheduled',
    },
  ];

  await Hearing.create(hearingsData);
  console.log('📅 Created', hearingsData.length, 'hearings');

  console.log('\n✅ Seed complete! Credentials:');
  console.log('   Admin:   admin@eportal.in        / Admin@123');
  console.log('   Judge:   neelimasharma@eportal.in / Neelima@123');
  console.log('   Judge:   ananthhegde@eportal.in   / Ananth@123');
  console.log('   Lawyer:  shekharnayak@eportal.in  / Shashwat@123');
  console.log('   Lawyer:  ananyapatil@eportal.in   / Ananya@123');
  console.log('   Lawyer:  rajeshr@eportal.in        / Rajesh@123');
  console.log('   Litigant: aaravgupta@eportal.in   / Aarav@123');
  console.log('   Litigant: sjanaki@eportal.in      / Janaki@123');
  console.log('   Litigant: amitramesh@eportal.in   / Amit@123');
  console.log('   Litigant: priyankachatterjee@eportal.in / Priyanka@123');
  console.log('   Litigant: lakshmimenon@eportal.in / Lakshmi@123');
  console.log('   Litigant: thomasvarghese@eportal.in / Thomas@123\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
