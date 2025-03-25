const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const bcrypt = require('bcrypt');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static('public'));

const USERS_FILE = path.join(__dirname, 'users.json');
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

function loadUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

function loadMessages() {
  return JSON.parse(fs.readFileSync(MESSAGES_FILE));
}

function saveMessages(msgs) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(msgs, null, 2));
}

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).send('Λανθασμένο όνομα χρήστη');
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).send('Λανθασμένος κωδικός');
  res.send('OK');
});

app.get('/messages', (req, res) => {
  res.json(loadMessages());
});

app.delete('/messages', (req, res) => {
  saveMessages([]);
  res.send('Διαγράφηκαν όλα τα μηνύματα');
});

io.on('connection', (socket) => {
  socket.on('message', (data) => {
    const msgs = loadMessages();
    msgs.push(data);
    saveMessages(msgs);
    io.emit('message', data);
  });
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
