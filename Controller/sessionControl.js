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
    // sessionList[newID].addPlayer("12345");
    // sessionList[newID].addPlayer("qwe");
    console.log(`Session ${newID} created.`);
    setTimeout(checkForClear, 1800000, newID);
    return newID;
}

//Code 0 for session not exist, 1 for adding,
// 2 for already in session.
function addUserToSession(user, sessionID) {
    if (sessionID in sessionList) {
        if (sessionList[sessionID].players.includes(user)) {
            return {code: 2};
        }
        if (sessionList[sessionID].state === STATES.PLAYING) {
            return {
                code: 0,
                errMsg: 'Game has started in this room!'
            };
        } else if (sessionList[sessionID].state === STATES.ENDED) {
            return {
                code: 0,
                errMsg: 'Game has ended in this room!'
            };
        }
        if (sessionList[sessionID].players.length === 4) {
            return {
                code: 0,
                errMsg: "Room is already full!"
            };
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
            if (target.usersInfo[user].state === STATES.PLAYING) {
                return {
                    code: 0,
                    errMsg: 'User is already ready for the game.'
                };
            }
            target.playerReady(user);
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

function playerPickCard(username, roomID, color) {
    if (roomID in sessionList) {
        if (sessionList[roomID].players.includes(username)) {
            let targetSess = sessionList[roomID];
            if (targetSess.currentPlayer !== username) {
                return {
                    code: 0,
                    errMsg: "User is not the current active player."
                };
            }
            if (color === 'dark' && targetSess.blackDeck.length === 0) {
                return {
                    code: 0,
                    errMsg: "Empty Black Deck!"
                };
            } else if (color === 'light' && targetSess.whiteDeck.length === 0) {
                return {
                    code: 0,
                    errMsg: "Empty White Deck!"
                };
            } else if (targetSess.picked) {
                return {
                    code: 0,
                    errMsg: 'User has already picked a card!'
                };
            }
            targetSess.playerPick(username, color);
            return {code: 1};
        } else {
            return {
                code: 0,
                errMsg: "User is not in the requested session!"
            };
        }
    } else {
        return {
            code: 0,
            errMsg: 'Session does not exist!'
        };
    }
}

function playerGuessCard(username, roomID, targetUser, cardIndex, guessNum) {
    if (roomID in sessionList) {
        let targetSess = sessionList[roomID];
        if (targetSess.players.includes(username)) {
            if (targetSess.currentPlayer !== username) {
                if (targetSess.players.includes(targetUser)) {
                    if (targetSess.usersInfo[targetUser].cards.length <= cardIndex) {
                        return  {
                            code: 0,
                            errMsg: 'Target User doesn\'t have the requested card!'
                        };
                    } else if (!targetSess.picked) {
                        return {
                            code: 0,
                            errMsg: 'User must pick a remaining card first!'
                        };
                    }
                    targetSess.guessCard(username, targetUser, cardIndex, guessNum);
                } else {
                    return {
                        code: 0,
                        errMsg: 'target User is not in the requested session.'
                    };
                }
            } else {
                return {
                    code: 0,
                    errMsg: 'User is not the current active player!'
                };
            }
        } else {
            return {
                code: 0,
                errMsg: 'User is not in the requested session!'
            };
        }
    } else {
        return {
            code: 0,
            errMsg: 'Session does not exist!'
        };
    }
}

module.exports = {
    createNewRoom: getNewRoom,
    addUserToSession: addUserToSession,
    getRoomInfo: getRoomInfo,
    playerReady: playerReady,
    readyRoomList: readyRoomList,
    getSessionPlayers: getSessionPlayers,
    playerPickCard: playerPickCard,
    playerGuessCard: playerGuessCard
}