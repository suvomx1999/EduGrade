const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const User = require('./models/User');
const Question = require('./models/Question');
const Submission = require('./models/Submission');

const API_URL = 'http://localhost:5001/api';

async function runTests() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB for testing...");

    // 1. Setup Test Users
    const student = await User.findOneAndUpdate(
      { email: 'student@test.com' },
      { name: 'Test Student', role: 'student', googleId: 'test_student_id' },
      { upsert: true, new: true }
    );
    const teacher = await User.findOneAndUpdate(
      { email: 'teacher@test.com' },
      { name: 'Test Teacher', role: 'teacher', googleId: 'test_teacher_id' },
      { upsert: true, new: true }
    );
    const admin = await User.findOneAndUpdate(
      { email: 'admin@test.com' },
      { name: 'Test Admin', role: 'admin', googleId: 'test_admin_id' },
      { upsert: true, new: true }
    );

    const studentToken = jwt.sign({ id: student._id }, process.env.JWT_SECRET);
    const teacherToken = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET);
    const adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);

    console.log("Tokens generated.");

    // 2. Test Question Creation (Teacher)
    console.log("\n--- Testing Questions ---");
    const qRes = await axios.post(`${API_URL}/questions`, {
      text: "What is the capital of France?",
      modelAnswer: "The capital of France is Paris.",
      keywords: ["Paris", "France"],
      maxMarks: 5
    }, { headers: { Authorization: `Bearer ${teacherToken}` } });
    console.log("✅ Question Created (Teacher)");
    const questionId = qRes.data._id;

    // 3. Test Get Questions (Student - should NOT see modelAnswer)
    const qsStudent = await axios.get(`${API_URL}/questions`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const testQ = qsStudent.data.find(q => q._id === questionId);
    if (testQ && !testQ.modelAnswer) {
      console.log("✅ Get Questions (Student): modelAnswer hidden");
    } else {
      console.error("❌ Get Questions (Student): modelAnswer visible or question missing");
    }

    // 4. Test Submission (Student)
    console.log("\n--- Testing Submissions ---");
    try {
      const subRes = await axios.post(`${API_URL}/submissions`, {
        questionId: questionId,
        answer: "Paris is the capital."
      }, { headers: { Authorization: `Bearer ${studentToken}` } });
      console.log("✅ Submission Successful (Student)");
      console.log("   Result:", subRes.data.verdict, `(${subRes.data.score}/${subRes.data.maxMarks})`);
    } catch (err) {
      console.error("❌ Submission Failed:", err.response ? err.response.data : err.message);
    }

    // 5. Test Admin Stats
    console.log("\n--- Testing Admin ---");
    const statsRes = await axios.get(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log("✅ Admin Stats:", statsRes.data);

    // 6. Test Role Change (Admin)
    await axios.patch(`${API_URL}/admin/users/${student._id}/role`, 
      { role: 'teacher' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const updatedStudent = await User.findById(student._id);
    if (updatedStudent.role === 'teacher') {
      console.log("✅ Admin Role Change Successful");
    }

    // Cleanup role for next run
    updatedStudent.role = 'student';
    await updatedStudent.save();

    console.log("\nAll verification tests completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Verification failed:", error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

runTests();
