const socket = io();
let currentRoom = 'General';
let username = '';

// Set username and show chat screen
function setUsername() {
  const input = document.getElementById('usernameInput');
  const name = input.value.trim();

  if (name !== '') {
    socket.emit('registerUser', { username: name }, (response) => {
      if (response.success) {
        username = name;

        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('chat-screen').style.display = 'block';

        // ✅ Automatically join "General" room visually and on server
        joinRoom('General');
      } else {
        alert(response.message);
      }
    });
  } else {
    alert('Please enter a username');
  }
}


// Switch room
function joinRoom(room) {
  currentRoom = room;
  document.getElementById('current-room').textContent = room;
  document.getElementById('messages').innerHTML = '';
  socket.emit('joinRoom', room);
}



function createRoom() {
  const roomName = document.getElementById('newRoomName').value.trim();
  const roomType = document.getElementById('roomType').value;

  if (roomName === '') {
    alert('Please enter a room name');
    return;
  }

  let fullRoomName = roomName;

  if (roomType === 'Private') {
    const targetUser = prompt('Enter the username of the person you want to chat with privately:');
    if (!targetUser) return;
    fullRoomName = `dm_${username}_${targetUser}`;
  }

  const ul = document.querySelector('.sidebar ul');
  const li = document.createElement('li');
  li.textContent = `${roomName} (${roomType})`;
  li.onclick = () => joinRoom(fullRoomName);
  ul.appendChild(li);

  joinRoom(fullRoomName);
}




// Send message
function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();

  if (message !== '') {
    socket.emit('chatMessage', { room: currentRoom, username, message });
    input.value = '';
  }
}

// Receive and display message
socket.on('chatMessage', ({ username, message }) => {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = `${username}: ${message}`;
  document.getElementById('messages').appendChild(msgDiv);
});

function logout() {
  // Leave the current room
  socket.emit('leaveRoom', currentRoom);

  // Reset state
  username = '';
  currentRoom = 'General';
  document.getElementById('messageInput').value = '';
  document.getElementById('messages').innerHTML = '';

  // Hide chat, show login
  document.getElementById('chat-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'block';
}
