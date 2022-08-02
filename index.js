const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
const dotenv = require('dotenv').config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['get', 'post']
  }
})

app.use(cors())


let onlUsers = [];
io.on("connection", (socket) => {
  socket.emit('me', socket.id)
  onlUsers.push(socket.id)
  io.emit('onl', onlUsers)

  socket.on('callUser', ({ from, to, signal }) => {
    socket.to(to).emit('callUser', ({ from, to, signal }))
  })
  socket.on('answer', ({ signal, to }) => {
    console.log(to)
    socket.to(to).emit('answer', { signal })
  })


  socket.on('disconnect', () => {
    onlUsers = onlUsers.filter(onlUser => onlUser !== socket.id)
  })
})



server.listen(process.env.PORT, () => {
  console.log(`app is runing on port ${process.env.PORT}`)
})

//change


