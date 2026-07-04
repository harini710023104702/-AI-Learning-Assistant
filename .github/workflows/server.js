const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mysql = require("mysql2");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// MYSQL CONNECTION
// ===============================
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "WJ28@krhps",
    database: "ai_assistant"
});

db.connect((err) => {
    if (err) {
        console.log("❌ MySQL Error:", err.message);
    } else {
        console.log("✔ MySQL Connected");
    }
});

// ===============================
// OPENROUTER API KEY
// ===============================
const GEMINI_API_KEY = "AQ.Ab8RN6LV033Ka0OkIXscNEMn57wl3KooZb5tvlMoc6p1R72whg";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});
// ===============================
// COMMON AI PROMPT
// ===============================
const SYSTEM_PROMPT = `
You are an AI Learning Assistant for college students.

Always answer in HTML format.

Rules:
- Use <h1> for the main title.
- Use <h2> for section headings.
- Use <p> for paragraphs.
- Use <ul><li> for bullet points.
- Use <pre><code> for code examples (if needed).
- Keep the language simple and easy to understand.
- Make the output neat and attractive.
- Do not use Markdown (#, ##, **).
`;
 // ===============================
// 💬 CHAT (AI)
// ===============================
app.post("/chat", async (req, res) => {

    const question = req.body.question;

    if (!question) {
        return res.json({
            reply: "No question received"
        });
    }

    try {

const result = await model.generateContent(`
${SYSTEM_PROMPT}

Question:
${question}
`);


        const answer = result.response.text();

        // Save chat to MySQL
        db.query(
            "INSERT INTO chat_history (question, answer) VALUES (?, ?)",
            [question, answer],
            (err) => {
                if (err) {
                    console.log("DB Error:", err.message);
                }
            }
        );

        res.json({
            reply: answer
        });

    } catch (error) {

        console.log("AI ERROR:", error);

        res.json({
            reply: "❌ AI Error"
        });

    }

});      
// ===============================
// 👤 REGISTER
// ===============================
app.post("/register", (req, res) => {

    const { name, email, password } = req.body;

  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, password],
    (err) => {

        if (err) {
            return res.json({
                message: "❌ Registration Error"
            });
        }

        // Create progress record for the new student
        db.query(
            "INSERT INTO student_progress (email) VALUES (?)",
            [email],
            (err2) => {

                if (err2) {
                    console.log("Progress Record Error:", err2.message);
                }

                res.json({
                    message: "✔ User Registered Successfully"
                });

            }
        );

    }
);
});

// ===============================
// 🔐 LOGIN
// ===============================
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email=? AND password=?",
        [email, password],
        (err, result) => {

            if (err) {
                res.json({ message: "❌ DB Error" });
            } else if (result.length > 0) {
                res.json({ message: "✔ Login Successful" });
            } else {
                res.json({ message: "❌ Invalid Credentials" });
            }
        }
    );
});
// ===============================
// 🧪 QUIZ
// ===============================
app.post("/quiz", async (req, res) => {

    const { topic, email } = req.body;

    if (!topic) {
        return res.json({
            quiz: "❌ Please enter a topic"
        });
    }

    try {

const result = await model.generateContent(`
${SYSTEM_PROMPT}

Generate 5 MCQ questions on:
${topic}
`);
        const quiz = result.response.text();

// Update progress
db.query(
    "UPDATE student_progress SET quizzes_completed = quizzes_completed + 1 WHERE email = ?",
    [email],
    (err) => {
        if (err) {
            console.log("Quiz Progress Error:", err.message);
        }
    }
);
res.json({
    quiz: quiz
});    } catch (error) {
        console.log("QUIZ ERROR:", error);

        res.json({
            quiz: "❌ Quiz generation failed"
        });
    }

}); 
// ===============================
// 📊 PLACEMENT APTITUDE (FIXED)
// ===============================
app.post("/aptitude", async (req, res) => {

    const topic = req.body.topic;

    if (!topic) {
        return res.json({
            questions: "❌ Please enter a topic"
        });
    }

    try {

        const result = await model.generateContent(`
${SYSTEM_PROMPT}

Generate 5 simple placement aptitude MCQ questions on: ${topic}

Format:
Question:
A) option
B) option
C) option
D) option

Correct Answer:
Explanation:
`);

        const questions = result.response.text();

        res.json({
            questions: questions
        });

    } catch (error) {

        console.log("APTITUDE ERROR:", error);

        res.json({
            questions: "❌ Failed to generate questions"
        });
    }


});// ===============================
// 📝 NOTES
// ===============================
app.post("/notes", async (req, res) => {

    const topic = req.body.topic;

    if (!topic) {
        return res.json({
            notes: "❌ Please enter a topic"
        });
    }

    try {

        const result = await model.generateContent(`
${SYSTEM_PROMPT}

Generate detailed notes on:
${topic}
`);
const notes = result.response.text();

// Update progress
db.query(
    "UPDATE student_progress SET notes_generated = notes_generated + 1 WHERE email = ?",
    ["student@gmail.com"], // We'll replace this with the logged-in user's email later
    (err) => {
        if (err) {
            console.log("Progress Update Error:", err.message);
        }
    }
);

res.json({
    notes: notes
});
      
    } catch (error) {

        console.log("NOTES ERROR:", error);

        res.json({
            notes: "❌ Notes generation failed"
        });

    }

});
// ===============================
// 📜 HISTORY
// ===============================
app.get("/history", (req, res) => {

    db.query("SELECT * FROM chat_history ORDER BY id DESC", (err, result) => {
        if (err) {
            res.json([]);
        } else {
            res.json(result);
        }
    });

});
// ===============================
// 📅 AI STUDY PLANNER
// ===============================
app.post("/studyplan", async (req, res) => {

    const { goal, days,email } = req.body;

    if (!goal || !days) {
        return res.json({
            plan: "❌ Please enter your goal and number of days."
        });
    }

    try {

        const result = await model.generateContent(`
${SYSTEM_PROMPT}

Create a ${days}-day study plan for a student whose goal is:

${goal}

Instructions:
- Give a day-by-day study schedule.
- Use HTML format only.
- Use <h1>, <h2>, <ul>, <li>, and <p>.
- Keep the language simple.
- Include revision and practice sessions.
- End with motivational advice.
`);

        
const plan = result.response.text();

// Update progress

  db.query(
    "UPDATE student_progress SET studyplans_generated = studyplans_generated + 1 WHERE email = ?",
    [email], // We'll use the logged-in user's email later
    (err) => {
        if (err) {
            console.log("Progress Update Error:", err.message);
        }
    }
);

res.json({
    plan: plan
});
    } catch (error) {

        console.log("STUDY PLAN ERROR:", error);

        res.json({
            plan: "❌ Failed to generate study plan."
        });

    }

});
// ===============================
// 📈 GET STUDENT PROGRESS
// ===============================// ===============================
// 📈 GET STUDENT PROGRESS
// ===============================
app.post("/progress", (req, res) => {

    const email = req.body.email;

    db.query("SELECT COUNT(*) AS quizzes FROM quizzes WHERE email=?", [email], (err, qResult) => {

        if (err || !qResult) {
            return res.json({ quizzes: 0, notes: 0, plans: 0 });
        }

        db.query("SELECT COUNT(*) AS notes FROM notes WHERE email=?", [email], (err2, nResult) => {

            if (err2 || !nResult) {
                return res.json({ quizzes: 0, notes: 0, plans: 0 });
            }

            db.query("SELECT COUNT(*) AS plans FROM studyplans WHERE email=?", [email], (err3, pResult) => {

                if (err3 || !pResult) {
                    return res.json({ quizzes: 0, notes: 0, plans: 0 });
                }

                res.json({
                    quizzes: qResult?.[0]?.quizzes || 0,
                    notes: nResult?.[0]?.notes || 0,
                    plans: pResult?.[0]?.plans || 0
                });

            });

        });

    });

});
// ===============================
// 🚀 START SERVER
// ===============================
app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});