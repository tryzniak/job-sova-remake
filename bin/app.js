const server = require("../src/server");
const port = process.env.APP_PORT || 3000;
server.listen(port, () => console.log(`The app is listening on ${port}`));
