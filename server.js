const express = require('express');
const fs = require('fs');
const http = require('http');
const bcrypt = require('bcrypt');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

const users = [
  { username: 'Iasonas', password: bcrypt.hashSync('1234', 10) },
  { username: 'Eleni', password: bcrypt.hashSync('4321', 10) }
];

let messages = [];

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).send('Δεν υπάρχει αυτός ο χρήστης');
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).send('Λάθος κωδικός');
  }
  res.send('ok');
});

io.on('connection', (socket) => {
  console.log('🟢 Νέα σύνδεση');

  socket.emit('load messages', messages);

  socket.on('chat message', (data) => {
    messages.push(data);
    io.emit('chat message', data);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Αποσυνδέθηκε');
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
