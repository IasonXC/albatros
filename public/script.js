const socket = io();
const input = document.getElementById("input");
const messagesDiv = document.getElementById("messages");
const username = localStorage.getItem("username");

function send() {
  const msg = input.value.trim();
  if (!msg) return;

  const messageData = {
    username,
    text: msg,
    time: new Date().toLocaleTimeString()
  };

  socket.emit("chat message", messageData);
  input.value = "";
}

socket.on("chat message", (data) => {
  const div = document.createElement("div");
  div.classList.add("message");
  if (data.username === username) div.classList.add("me");

  div.innerHTML = `
    <div class="message-content">
      <div><strong>${data.username}:</strong> ${data.text}</div>
      <span class="timestamp">${data.time}</span>
    </div>`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on("load messages", (allMessages) => {
  allMessages.forEach(m => {
    const div = document.createElement("div");
    div.classList.add("message");
    if (m.username === username) div.classList.add("me");
    div.innerHTML = `
      <div class="message-content">
        <div><strong>${m.username}:</strong> ${m.text}</div>
        <span class="timestamp">${m.time}</span>
      </div>`;
    messagesDiv.appendChild(div);
  });
});

function logout() {
  localStorage.removeItem("username");
  window.location.href = "login.html";
}
