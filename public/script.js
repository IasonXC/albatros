const username = localStorage.getItem("username");
if (!username) window.location = "/login.html";

const socket = io();
const messages = document.getElementById("messages");
const input = document.getElementById("input");
const emojiPicker = document.getElementById("emojiPicker");

function render(msg) {
  const div = document.createElement("div");
  div.className = "message" + (msg.username === username ? " me" : "");
  div.innerHTML = `<strong>${msg.username}:</strong> ${msg.text || ""}`;
  if (msg.image) {
    const img = document.createElement("img");
    img.src = msg.image;
    div.appendChild(img);
  }
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function send() {
  const text = input.value.trim();
  if (!text) return;
  const msg = { username, text };
  socket.emit("message", msg);
  input.value = "";
}

function sendImage(inputEl) {
  const file = inputEl.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const msg = { username, image: reader.result };
    socket.emit("message", msg);
  };
  reader.readAsDataURL(file);
}

function toggleEmoji() {
  emojiPicker.style.display =
    emojiPicker.style.display === "none" ? "block" : "none";
}

emojiPicker.addEventListener("click", (e) => {
  if (e.target.tagName === "SPAN") {
    input.value += e.target.textContent;
    input.focus();
  }
});

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") send();
});

function logout() {
  localStorage.removeItem("username");
  window.location = "/login.html";
}

fetch("/messages")
  .then((res) => res.json())
  .then((data) => data.forEach(render));

socket.on("message", render);
