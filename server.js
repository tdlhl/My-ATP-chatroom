const path = require('path')
const http = require('http')
const Koa = require('koa')
const serve = require('koa-static')
const socketIO = require('socket.io')

const hostname = '127.0.0.1'
const port = 3000
const publicPath = path.join(__dirname, 'public')


const app = new Koa()

const server = http.createServer(app.callback())

const io = socketIO(server)


io.use((socket, next) => {
	const { name,password } = socket.handshake.query
	if(name!="federer" && name!="nadal" && name!="djokovic" && name!="lhl") {
		return next(new Error('INVALID_USERNAME'))
	}
	if(password !== 'vamos rafa') {
		return next(new Error('INVALID_PASSWORD'))
	}
	next()
});

const users = new Map()

const history = []
io.on('connection', (socket) => {

	const name = socket.handshake.query.name;
	users.set(name, socket)
	console.log(`${name} connected`);

	io.sockets.emit('online', [...users.keys()])

	socket.on('sendMessage', (content) => {
		console.log(`${name} send a message:${content}`);

		const message = {
			time: Date.now(),
			sender: name,
			isMsgMe: false,
			content: content,
		}
		history.push(message)
		io.sockets.emit('receiveMessage', message)
	})

	socket.on('disconnect', (reason) => {
		console.log(`${name} disconnected, reason:${reason}`);
		users.delete(name)

		io.sockets.emit('online', [users.keys()])
	})
})


app.use(serve(publicPath))

app.use((ctx) => {
	if(ctx.request.path === '/history') {

		ctx.body = history
	}
})
server.listen(port, hostname, () => {
	console.log(`server running at http://${hostname}:${port}`);
});