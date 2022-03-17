const userName = document.getElementById('userName');
const password = document.getElementById('password');
const loginBox = document.getElementById('login');
const chatroom = document.getElementById('chatroom');
const loginBtn = document.querySelector('.login-button');

const sendBtn = document.getElementById('send');
const sendInput = document.getElementById('sendInput');
const msgList = document.querySelector('.list');
const msgBox = document.querySelector('.list-item');

let socket = null

function login(userName, passWord) {

	socket = io({
		query: {
			name: userName,
			password: passWord,
		},
		reconnection: false,
	})
	// 认证失败
	socket.on('connect_error', (err) => {
		if(err && err.message === 'INVALID_USERNAME' || err.message === 'INVALID_PASSWORD') {
			alert('认证失败！');
			return;
		}
		alert('连接失败,请检查WebSocket服务器')
	})
	// 登陆成功
	socket.on('connect', () => {

		window.localStorage.setItem('userName', userName)
		window.localStorage.setItem('passWord', passWord)
		showChatroom()
		fetch('/history').then(res => res.json()).then((history) => {
			console.log('history:', history);
			history.forEach(item => {

				if(item.sender === userName) {
					item.isMsgMe = true
				}
			})
			updateMessageList(history)
		})
	})

	socket.on('disconnect', (users) => {
		console.log(`${userName}下线了！`);
		renderUserList(users)
		// 连接断开
	})
	// 广播消息
	socket.on('receiveMessage', (message) => {
		console.log('received a broadcast message.', message);
		if(message.sender === userName) {
			message.isMsgMe = true
		}
		addMsg(message,message.sender)
	})

	socket.on('online', (users) => {
		console.log('online users', users);
		renderUserList(users)
	})
}
// 发送消息
function send(msg) {
	socket.emit('sendMessage', msg)
}
// 渲染在线用户列表
function renderUserList(users) {
	const userList = document.querySelector('.contact-list')
	userList.innerHTML = '';
	users.forEach(user => {
		const li = document.createElement('li')
		li.setAttribute('class', 'contact-item')
		li.innerText = user
		userList.appendChild(li)
	})
}
// 每次登录时更新消息框中的所有消息
function updateMessageList(history) {
	history.forEach(hr => {
		console.log(JSON.stringify(hr));
		console.log("发送者：",hr.sender);
		addMsg(hr,hr.sender)
	})
}
// 向消息框追加一条消息
function addMsg(message,sender) {
	const msgBox = document.createElement('div');
	const msgMe = document.createElement('div');
	const imgMe = document.createElement('img');

	if(sender=="federer"){
		imgMe.src = "./f.png"
	}
	else if(sender=="nadal"){
		imgMe.src = "./n.png"
	}
	else if(sender=="djokovic"){
		imgMe.src = "./d.png"
	}
	else{
		imgMe.src = "./ATP_Tennis.png"
	}
	
	msgMe.innerHTML = message.content

	msgMe.setAttribute('class', 'message');
	imgMe.setAttribute('class', 'avatar');

	if(message.isMsgMe === true) {
		msgBox.setAttribute('class', 'list-item');
		msgBox.appendChild(msgMe);
		msgBox.appendChild(imgMe);
	}
	else { 
		msgBox.setAttribute('class', 'list-item-left')
		msgBox.appendChild(imgMe);
		msgBox.appendChild(msgMe);
	}
	msgList.appendChild(msgBox);
}

function handleLogin() {

	const username = document.querySelector('#userName').value

	const password = document.querySelector('#password').value
	login(username, password)
}
function showChatroom() {
	loginBox.style.display = 'none'
	chatroom.style.visibility = 'visible'
}

sendBtn.addEventListener('click', () => {

	let message = sendInput.value
	console.log(message)
	if(message.length > 0) {
		send(message)
		clearBox()
	}
})

function clearBox(){

	document.getElementById('sendInput').value = null
}