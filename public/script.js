const socket = io();
const username = localStorage.getItem("username");

socket.emit("join", username);

const messages = document.getElementById("messages");
const usersDiv = document.getElementById("users");
const typingDiv = document.getElementById("typing");
const input = document.getElementById("input");
const form = document.getElementById("form");

let typingTimeout;

// SEND MESSAGE
form.addEventListener("submit", e => {
  e.preventDefault();
  if(input.value){
    socket.emit("chat message", input.value);
    socket.emit("stop typing");
    input.value = "";
  }
});

// TYPING
input.addEventListener("input", () => {
  socket.emit("typing");

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("stop typing");
  }, 1200);
});

// RECEIVE MESSAGE
socket.on("chat message", data => {

  const msg = document.createElement("div");
  msg.className = "msg " + (data.user === username ? "self" : "");

  msg.innerHTML = `
    <div class="bubble">
      <div class="meta">${data.user}</div>
      ${data.message}
    </div>
  `;

  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
});

// USER START TYPING
socket.on("typing", name => {

  const el = document.getElementById(`typing-${name}`);
  if(el){
    el.innerText = "typing...";
  }
});

// USER STOP TYPING
socket.on("stop typing", name => {

  const el = document.getElementById(`typing-${name}`);
  if(el){
    el.innerText = "";
  }
});


// Online User + Typing Indicator
let typingUsers = {};

// ONLINE USERS RENDER
socket.on("online users", users => {

  usersDiv.innerHTML = "";
  const names = Object.values(users);

  document.getElementById("online-count").innerText = names.length;
  document.getElementById("online-badge").innerText = `${names.length} online`;

  names.forEach(name => {

    const div = document.createElement("div");
    div.className = "user";

    div.innerHTML = `
      <div class="avatar">${name[0].toUpperCase()}</div>
      
      <div class="user-info">
        <div class="username">${name}</div>
        <div class="user-typing" id="typing-${name}"></div>
      </div>

      <div class="online-dot"></div>
    `;

    usersDiv.appendChild(div);
  });
});