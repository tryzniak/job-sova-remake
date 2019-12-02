const { httpServer, wsServer } = require("../src/server");
const port = process.env.APP_PORT || 3000;
const http = require("http").createServer(httpServer);
wsServer.attach(http, { path: "/socket.io", cookies: true });

http.listen(port, () => console.log(`The app is listening on ${port}`));
