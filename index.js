const Koa = require('koa');
const websocketServer = require('websocket').server;
const kStatic = require('koa-static');
const path = require('path');
const bodyParser = require('koa-bodyparser');
const mount = require('koa-mount');
const logger = require('koa-logger');
const kView = require('koa-views');
const sessionControl = require('./Controller/sessionControl');
require('./Controller/AsciiArt');

const app = new Koa();
let server = app.listen(18623);
console.log("Listening on port 18623");
//app.use(logger())

let staticKoa = new Koa();
staticKoa.use(kStatic(
    path.join(__dirname, './static')
))
app.use(kView('view', {
    root: __dirname + '/view',
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
let wsReqCount = 0;

function sendBack(conn, data) {
    console.log(`${conn.sess}:${conn.user} <== ${data}`);
    conn.send(data);
}

function roomBroadcastInfo(roomID) {
    let players = sessionControl.getSessionPlayers(roomID);
    for (let p of players) {
        if ((p + roomID) in connections) {
            let conn = connections[p + roomID];
            let info = sessionControl.getRoomInfo(p, roomID)
            sendBack(conn, `roomInfo||${info.data}`);
        }
    }
}

function broadcastNewRoomList() {
    let retVal = sessionControl.readyRoomList();
    //roomList||{room}||{room}||...
    let retStr = "roomList";
    for (let room of retVal) {
        retStr = retStr + `||${room}`;
    }
    for (let id in allConn) {
        allConn[id].send(retStr);
    }
}

//id=user+sessID
let connections = {};
let allConn = {};

wsServer.on('request', function(request) {
    console.log(new Date() + ' Connection accepted.');
    let conn = request.accept();
    let connID = Math.random().toString(36).substring(3);
    conn.sign = connID;
    allConn[connID] = conn;

    conn.on('message', async function(data) {
        wsReqCount++;
        let str = data.utf8Data;
        console.log("ws Request " + wsReqCount + ": " + str);
        let instructions = str.split('&&');
        console.log(`${conn.user}: ${instructions}`);
        let retVal = null;
        let retStr = "";
        let roomID = "";
        let username = "";
        switch(instructions[0].toLocaleLowerCase()) {
            //getNewRoom
            case 'getnewroom':
                let newRoomID = sessionControl.createNewRoom();
                //newRoomNum||{roomID}
                sendBack(conn, `newRoomNum||${newRoomID}`);
                broadcastNewRoomList();
                break;
            //joinRoom&&username&&roomID
            case 'joinroom':
                retVal = sessionControl.addUserToSession(instructions[1], instructions[2]);
                if (retVal.code === 0) {
                    //Fail||{msg}
                    sendBack(conn, `Fail||${retVal.errMsg}`);
                }
                else {
                    conn.user = instructions[1];
                    conn.sess = instructions[2];
                    connections[conn.user + conn.sess] = conn;
                    //joinOK||{username}||{roomID}
                    sendBack(conn, `joinOK||${instructions[1]}||${instructions[2]}`);
                    roomBroadcastInfo(instructions[2]);
                }
                break;
            //getRoomInfo&&username&&roomID
            case 'getroominfo':
                retVal = sessionControl.getRoomInfo(instructions[1], instructions[2]);
                if (retVal.code === 0) {
                    sendBack(conn, `Fail||${retVal.errMsg}`);
                }
                else {
                    //roomInfo||{roomInfoJSON}
                    sendBack(conn, `roomInfo||${retVal.data}`);
                }
                break;
            //getRoomList
            case 'getroomlist':
                retVal = sessionControl.readyRoomList();
                //roomList||{room}||{room}||...
                retStr = "roomList";
                for (let room of retVal) {
                    retStr = retStr + `||${room}`;
                }
                sendBack(conn, retStr);
                break;
            //playerReady&&username&&roomID
            case 'playerready':
                retVal = sessionControl.playerReady(instructions[1], instructions[2]);
                if (retVal.code === 1) {
                    roomBroadcastInfo(instructions[2]);
                } else {
                    sendBack(conn, `Fail||${retVal.errMsg}`);
                }
                break;
            //playerPick&&username&&roomID&&pickColor
            case 'playerpick':
                let user = instructions[1];
                roomID = instructions[2];
                let color = instructions[3].toLocaleLowerCase();
                retVal = sessionControl.playerPickCard(user, roomID, color);
                if (retVal.code === 1) {
                    roomBroadcastInfo(roomID);
                } else {
                    sendBack(conn, `Fail||${retVal.errMsg}`);
                }
                break;
            //playerGuess&&username&&roomID&&targetUser&&cardIndex&&guessNum
            case 'playerguess':
                username = instructions[1];
                roomID = instructions[2];
                let targetUser = instructions[3];
                let targetCardIndex = instructions[4];
                let guessNum = instructions[5];
                retVal = sessionControl.playerGuessCard(username, roomID, targetUser, targetCardIndex, guessNum);
                if (retVal.code === 1) {
                    roomBroadcastInfo(roomID);
                } else {
                    sendBack(conn, `Fail||${retVal.errMsg}`);
                }
                break;
            //swapCard&&username&&roomID&&cardIndex
            case 'swapcard':
                username = instructions[1];
                roomID = instructions[2];
                let cardIndex = instructions[3];
                retVal = sessionControl.playerSwapCard(username, roomID, cardIndex);
                if (retVal.code === 1) {
                    roomBroadcastInfo(roomID);
                } else {
                    sendBack(conn, `Fail||${retVal.errMsg}`);
                }
                break;
        }
    });

    conn.on('close', async function(code, reason){
        if (conn.user && conn.sess) {
            console.log("Close: " + conn.user);
            delete connections[conn.user + conn.sess];
            let players = sessionControl.getSessionPlayers(conn.sess);
            for (let pl of players) {
                if ((pl + conn.sess) in connections) {
                    connections[pl + conn.sess].sendUTF('userLogOut||' + conn.user);
                }
            }
        }
        if (conn.sign) {
            delete allConn[conn.sign];
        }
    });

    conn.on('error', async function(code, reason){
        if (conn.user && conn.sess) {
            console.log("Error: " + conn.user);
            delete connections[conn.user + conn.sess];
            let players = sessionControl.getSessionPlayers(conn.sess);
            for (let pl of players) {
                if ((pl + conn.sess) in connections) {
                    connections[pl + conn.sess].sendUTF('userLogOut||' + conn.user);
                }
            }
        }
        if (conn.sign) {
            delete allConn[conn.sign];
        }
    });
})

