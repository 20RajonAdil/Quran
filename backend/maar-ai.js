/**
 * MAAR AI - Single-file Backend + Frontend
 * Run: node maar-ai.js
 * Open browser at: http://localhost:3000
 */

import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;

// Serve frontend HTML
app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>MAAR AI</title>
<style>
* { box-sizing: border-box; font-family: Arial, sans-serif; }
body { margin:0; background:black; color:white; overflow:hidden; }
.background { position:fixed; inset:0; background:radial-gradient(circle at center, #1a1a1a, black);
animation: silk 20s linear infinite; z-index:-1; }
@keyframes silk {0%{filter:hue-rotate(0deg);}100%{filter:hue-rotate(360deg);}}
.nav { display:flex; gap:10px; padding:10px; }
.nav button { background:#111; color:white; border:1px solid #333; padding:8px 16px; cursor:pointer; }
.section { display:none; padding:20px; }
.section.active { display:block; }
#chat-box { height:60vh; overflow-y:auto; border:1px solid #333; padding:10px; margin-bottom:10px; }
.msg { margin-bottom:10px; }
.user { color:#6cf; }
.ai { color:#6f6; }
.input-area { display:flex; gap:10px; }
input { flex:1; padding:10px; }
button { padding:10px; cursor:pointer; position:relative; }
.title.split-text span { display:inline-block; transition: transform 0.3s ease, color 0.3s ease; }
.title.split-text span:hover { transform: translateY(-10px) rotate(-10deg); color:#6cf; }
#send-btn:active::after { content:""; position:absolute; width:10px; height:10px; background:yellow; border-radius:50%; animation:spark 0.5s linear forwards; }
@keyframes spark { 0%{transform:scale(1);}100%{transform:scale(5);opacity:0;} }
</style>
</head>
<body>

<div class="background"></div>

<nav class="nav">
  <button onclick="showSection('chat')">Chat</button>
  <button onclick="showSection('about')">About</button>
</nav>

<section id="chat" class="section active">
  <h1 class="title split-text">MAAR AI</h1>
  <div id="chat-box"></div>
  <div class="input-area">
    <input id="user-input" placeholder="Type your message..." />
    <button id="send-btn">Send</button>
  </div>
</section>

<section id="about" class="section">
  <h2>About MAAR AI</h2>
  <p>MAAR AI is a single-user intelligent assistant built with OpenAI.</p>
</section>

<script>
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
sendBtn.onclick = sendMessage;
input.addEventListener("keydown", e => { if(e.key==="Enter") sendMessage(); });

// Split text animation
document.querySelectorAll('.split-text').forEach(el=>{
  el.innerHTML = el.textContent.split('').map(c=>\`<span>\${c}</span>\`).join('');
});

function addMessage(text,className){
  const div=document.createElement("div");
  div.className=\`msg \${className}\`;
  div.textContent=text;
  chatBox.appendChild(div);
  chatBox.scrollTop=chatBox.scrollHeight;
}

async function sendMessage(){
  const text=input.value.trim();
  if(!text) return;
  addMessage("You: "+text,"user");
  input.value="";
  const thinking = document.createElement("div");
  thinking.className="msg ai";
  thinking.textContent="MAAR AI is thinking...";
  chatBox.appendChild(thinking);

  try {
    const res = await fetch("/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message:text})
    });
    const data = await res.json();
    thinking.remove();
    addMessage(data.reply?"MAAR AI: "+data.reply:"Error: No reply","ai");
  } catch(err){
    thinking.remove();
    addMessage("Server not reachable","ai");
  }
}

function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
</script>

</body>
</html>`);
});

// Handle chat request
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) return res.status(400).json({ error: "Message required" });

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          { role: "system", content: "You are MAAR AI, a helpful assistant." },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();
    const reply = data.output_text || data.output?.[0]?.content?.[0]?.text || "No response";
    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log(\`✅ MAAR AI running at http://localhost:\${PORT}\`));
