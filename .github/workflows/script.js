// ===============================
// 🔐 REGISTER USER
// ===============================
async function registerUser() {
    try {
        let name = document.getElementById("name").value;
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;

        let resultBox = document.getElementById("registerResult");

        resultBox.innerHTML = "Registering...";

        let response = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        let data = await response.json();

        if(response.ok){

            resultBox.innerHTML = "✅ Registered Successfully! Redirecting...";

            localStorage.setItem("loggedIn", "true");
localStorage.setItem("email", email);

            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);

        } else {

            resultBox.innerHTML = data.message;

        }

    } catch (error) {
        document.getElementById("registerResult").innerHTML = "❌ Server Error";
    }
}

// ===============================
// 💬 CHAT FUNCTION (FIXED)
// ===============================
function addMessage(text, type) {
    const chatBox = document.getElementById("chatBox");

    const msg = document.createElement("div");
    msg.classList.add("msg", type);
    msg.innerText = text;

    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function askAI() {

    const input = document.getElementById("question");
    const message = input.value.trim();

    if (!message) return;

    addMessage(message, "user");

    input.value = "";

    const loading = document.createElement("div");
    loading.classList.add("msg", "bot");
    loading.innerText = "🤖 Thinking...";

    document.getElementById("chatBox").appendChild(loading);

    fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ question: message })
    })
    .then(res => res.json())
    .then(data => {

          loading.innerHTML =
    "<div class='ai-box'>" +
    (data.answer || data.reply || "❌ No response")
        .replace(/\n/g, "<br>")
    + "</div>"; })
    .catch(() => {
        loading.innerText = "❌ Server Error";
    });
}  

// ===============================
// 🧪 GENERATE QUIZ
// ===============================
async function generateQuiz() {
    try {
        let topic = document.getElementById("quizTopic").value;
        let quizBox = document.getElementById("quizResult");

        quizBox.innerHTML = "Generating Quiz...";

        let response = await fetch("http://localhost:3000/quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
    topic,
    email: localStorage.getItem("email")
})
        });

        let data = await response.json();

        quizBox.innerHTML = data.quiz || "No quiz generated";

    } catch (error) {
        document.getElementById("quizResult").innerHTML = "❌ Error generating quiz";
    }
}

// ===============================
// 📝 GENERATE NOTES
// ===============================
async function generateNotes() {
    try {
        let topic = document.getElementById("notesTopic").value;
        let notesBox = document.getElementById("notesResult");

        notesBox.innerHTML = "Generating Notes...";

        let response = await fetch("http://localhost:3000/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic })
        });

        let data = await response.json();

        notesBox.innerHTML = data.notes || "No notes generated";

    } catch (error) {
        document.getElementById("notesResult").innerHTML = "❌ Error generating notes";
    }
}

// ===============================
// 📜 CHAT HISTORY
// ===============================
async function loadHistory() {
    try {
        let historyBox = document.getElementById("historyResult");

        historyBox.innerHTML = "Loading...";

        let response = await fetch("http://localhost:3000/history");
        let data = await response.json();

        let output = "";

        data.forEach(chat => {
            output += `
                <p><b>Q:</b> ${chat.question}</p>
                <p><b>A:</b> ${chat.answer}</p>
                <hr>
            `;
        });

        historyBox.innerHTML = output || "No history found";

    } catch (error) {
        document.getElementById("historyResult").innerHTML = "❌ Cannot load history";
    }
}
// ===============================
// 🌙 DARK / LIGHT MODE
// ===============================

function toggleTheme() {

    document.body.classList.toggle("light-mode");

    if(document.body.classList.contains("light-mode")) {
        localStorage.setItem("theme", "light");
    } else {
        localStorage.setItem("theme", "dark");
    }
}

// Load saved theme
if(localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
}

// ===============================
// ⌨️ PRESS ENTER TO SEND MESSAGE
// ===============================

document.addEventListener("keypress", function(event){

    if(event.key === "Enter"){

        const questionBox = document.getElementById("question");

        if(questionBox){
            askAI();
        }
    }

});
// ===============================
// 📄 DOWNLOAD NOTES AS PDF
// ===============================

function downloadPDF() {

    const notes =
        document.getElementById("notesResult").innerText;

    if(notes.trim() === "" ||
       notes === "Notes will appear here..."){
        alert("Generate notes first!");
        return;
    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("AI Learning Assistant Notes", 10, 15);

    doc.setFontSize(12);

    const lines =
        doc.splitTextToSize(notes, 180);

    doc.text(lines, 10, 30);

    doc.save("Study_Notes.pdf");
}
function checkScore(){

    let score = 0;

    const q1 =
        document.querySelector('input[name="q1"]:checked');

    const q2 =
        document.querySelector('input[name="q2"]:checked');

    if(q1 && q1.value === "a"){
        score++;
    }

    if(q2 && q2.value === "a"){
        score++;
    }

    document.getElementById("scoreResult").innerHTML =
        "🎯 Score: " + score + " / 2";
}
// ===============================
// 🎯 QUIZ SCORE
// ===============================


// ===============================
// 🧪 GENERATE QUIZ
// ===============================
async function generateQuiz() {

    try {

        let topic = document.getElementById("quizTopic").value;

        let quizBox = document.getElementById("quizResult");

        quizBox.innerHTML = "Generating Quiz...";

        let response = await fetch("http://localhost:3000/quiz", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ topic })
        });

        let data = await response.json();

        quizBox.innerHTML = data.quiz;

    } catch (error) {

        document.getElementById("quizResult").innerHTML =
            "❌ Error generating quiz";
    }
}
// ===============================
// 🎯 QUIZ SCORE
// ===============================
function checkScore() {

    document.getElementById("scoreResult").innerHTML = `
        <h2>🎯 Quiz Submitted Successfully!</h2>
        <h3>📚 Review the answers and explanations above.</h3>
    `;
}
// ===============================
// 📊 PLACEMENT APTITUDE
// ===============================
async function generateAptitude() {

    try {

        let topic = document.getElementById("aptitudeTopic").value;

        let box = document.getElementById("aptitudeResult");

        box.innerHTML = "Generating Questions...";

        let response = await fetch("http://localhost:3000/aptitude", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ topic: topic })
        });

        let data = await response.json();

        box.innerHTML = `<div class="ai-box">${data.questions}</div>`;

    } catch (error) {

        console.log(error);

        document.getElementById("aptitudeResult").innerHTML =
            "❌ Error generating questions";
    }
}