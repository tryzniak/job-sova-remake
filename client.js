const jwt = require("jsonwebtoken")

const employerToken = undefined // this stuff should come from the server upon signin
const employerChat = require("socket.io-client")("http://localhost:3000/chats", {forceNew: true, path: "/socket.io", query: {token: employerToken}})
employerChat.on("availableChatRooms", e => {
  employerChat.emit("chatMessage", {text: "Hello from employerChat", 
    roomId: e[0].id
  })
  employerChat.on("chatMessage", e => {
    console.log("inside2", e)
  })
})

const jobSeekerToken = undefined // this stuff should come from the server upon signin
const jobSeekerChat = require("socket.io-client")("http://localhost:3000/chats", {forceNew: true, path: "/socket.io", query: {token: jobSeekerToken}})
jobSeekerChat.on("availableChatRooms", e => {
  jobSeekerChat.emit("chatMessage", {
    roomId: e[0].id,
    text: "Hello from jobseeker"})

  jobSeekerChat.on("chatMessage", e => {
    console.log("inside", e)
  })
})

