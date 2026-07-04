const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", (req, res) => {
    res.json({ reply: "Server is working ✔" });
});

app.listen(3000, () => {
    console.log("Server running on 3000");
});