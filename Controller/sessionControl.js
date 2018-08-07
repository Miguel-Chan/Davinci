const GameSession = require('./GamePlay').GameSession;
const STATES = require('./GamePlay').STATES

function getRandomString() {
    return Math.random().toString(36).substring(3);
}

let sessionList = {};

function checkForClear(id) {
    if (id in sessionList) {
        if (sessionList[id].state === STATES.PLAYING) {
            //Wait another one hour and check.
            setTimeout(checkForClear, 1800000, id);
            console.log(`Session ${id} will stay for another half an hour.`);
        }
        else {
            //if the session has not yet started or has ended,
            // delete the session.
            delete sessionList[id];
            console.log(`Session ${id} has been deleted.`);
        }
    }
}

function getNewRoom() {
    let newID = getRandomString();
    sessionList[newID] = new GameSession(newID);
    console.log(`Session ${newID} created.`);
    setTimeout(checkForClear, 1800000, newID);
    return newID;
}

//Code 0 for session not exist, 1 for adding,
// 2 for already in session.
function addUserToSession(user, sessionID) {
    if (sessionID in sessionList) {
        if (sessionList[sessionID].players.length === 4) {
            return {
                code: 0,
                errMsg: "Room is already full!"
            };
        }
        if (sessionList[sessionID].players.includes(user)) {
            return {code: 2};
        }
        else {
            sessionList[sessionID].addPlayer(user);
            return {code: 1};
        }
    }
    else {
        return {
            code: 0,
            errMsg: "Session does not exists!"
        }
    }
}

function getRoomInfo(user, sessionID) {
    if (sessionID in sessionList) {
        if (sessionList[sessionID].players.includes(user)) {
            let target = sessionList[sessionID];
            let infoJSON = target.toInfoString(user);
            return {
                code: 1,
                data: infoJSON
            };
        }
        else {
            return {
                code: 0,
                errMsg: 'User is not in this game room!'
            };
        }
    }
    else {
        return {
            code: 0,
            errMsg: "Session does not exists!"
        }
    }
}

function readyRoomList() {
    let res = [];
    for (let sessID in sessionList) {
        if (sessionList[sessID].state === STATES.READY) {
            res.push(sessID);
        }
    }
    return res;
}

function playerReady(user, sessionID) {
    if (sessionID in sessionList) {
        if (sessionList[sessionID].players.includes(user)) {
            let target = sessionList[sessionID];
//TODO

            return {code: 1};
        }
        else {
            sessionList[sessionID].addUser(user);
            return {
                code: 0,
                errMsg: 'User is not in this game room!'
            };
        }
    }
    else {
        return {
            code: 0,
            errMsg: "Session does not exists!"
        }
    }
}

function getSessionPlayers(sessID) {
    let sess = sessionList[sessID];
    return sess.players;
}

module.exports = {
    createNewRoom: getNewRoom,
    addUserToSession: addUserToSession,
    getRoomInfo: getRoomInfo,
    playerReady: playerReady,
    readyRoomList: readyRoomList,
    getSessionPlayers: getSessionPlayers
}