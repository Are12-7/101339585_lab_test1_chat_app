const roomForm = document.getElementById('room-form');
const roomMessage = document.querySelector('.room-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Getting username and room 
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

// Join room
socket.emit('joinRoom', { username, room });

socket.on('roomUsers', ({ room, users }) => {displayRoomName(room); displayUsers(users);
  });

// Server Message
socket.on('message', message => {
    console.log(message);
    printMessage(message);

    //display message down
    roomMessage.scrollTop = roomMessage.scrollHeight;
    
});

socket.on('output-message', message => {
  console.log(message);
  printMessage(message.msg);

  //display message down
  roomMessage.scrollTop = roomMessage.scrollHeight;
  
});

// Message submit
roomForm.addEventListener('submit', e => {
    e.preventDefault();

    // Get message
    let msg = e.target.elements.msg.value;

    // Emit message
    socket.emit('roomMessage', msg);

    // Input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Print Message 
function printMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
    ${message.text}    
    </p>`;
    document.querySelector('.room-messages').appendChild(div);
}

// Adding room name
function displayRoomName(room) {
    roomName.innerText = room;
}
// Adding users
function displayUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
      const li = document.createElement('li');
      li.innerText = user.username;
      userList.appendChild(li);
    });
}

// Leave Room
document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
      window.location = '../index.html';
    } else {
    }
  });

  
