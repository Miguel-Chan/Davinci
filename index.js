const Koa = require('koa');
const websocketServer = require('websocket').server;
const kStatic = require('koa-static');
const path = require('path');
const bodyParser = require('koa-bodyparser');
const mount = require('koa-mount');
const logger = require('koa-logger');
const kView = require('koa-views');

const app = new Koa();
let server = app.listen(18623);
console.log("Listening on port 18623");
app.use(logger())

let staticKoa = new Koa();
staticKoa.use(kStatic(
    path.join(__dirname, './static')
))
app.use(kView('view', {
    root: __dirname + '/View',
    default: 'app',
    extension: 'pug'
}));
app.use(mount('/static', staticKoa));
app.use(bodyParser());

app.use(async function(ctx, next) {
    await ctx.render('app');
    next();
})


let wsServer = new websocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

wsServer.on('request', function(request) {
    console.log(new Date() + ' Connection accepted.');
    let conn = request.accept();

    conn.on('message', async function(data) {
        let str = data.utf8Data;
        console.log(conn.user + ": " + str);
        let instructions = str.split('&&');
        console.log(instructions);
        switch(instructions[0].toLocaleLowerCase()) {

        }
    })
})