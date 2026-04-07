const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

async function test() {
  try {
    console.log("URL:", `${process.env.NLP_SERVICE_URL}/evaluate`);
    const response = await axios.post(`${process.env.NLP_SERVICE_URL}/evaluate`, {
      student_answer: "Paris is the capital of France.",
      model_answer: "The capital of France is Paris.",
      keywords: ["Paris", "France"],
      max_marks: 10
    });
    console.log("Success:", response.data);
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
        console.error("Data:", error.response.data);
    }
  }
}

test();
