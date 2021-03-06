function isHttps() {
    return window.location.protocol === "https:";
}

function getWsPrefix() {
    return isHttps() ? "wss://" : "ws://"; 
}

class DavinciWsController {
    constructor() {
        this.connection = new WebSocket(getWsPrefix() + window.location.host);
        this.connection.onclose = function() {
            bootbox.alert("Connection Lost! Please reconnect by flushing the page.");
        }
        this.connection.onerror = function() {
            bootbox.alert("Connection Error! Please reconnect by flushing the page.");
        }
        this.prevMsg = "";
        this.connection.onmessage = function(recData) {
            let msg = recData.data;
            let data = msg.split("||");
            console.log(msg);
            let list = [];
            switch(data[0].toLocaleLowerCase()) {
                //newRoomNum||{roomID}
                case 'newroomnum':
                    initialVue.setNewRoomNumber(data[1]);
                    break;
                //roomList||{room}||{room}||...
                case 'roomlist':
                    for (let i = 1; i < data.length; i++) {
                        list.push(data[i]);
                    }
                    initialVue.setRoomList(list);
                    break;
                case 'joinok':
                    //joinOK||{username}||{roomID}
                    let username = data[1];
                    let room = data[2];
                    initialVue.user = username;
                    initialVue.room = room;
                    startGame();
                    break;
                //roomInfo||{roomInfoJSON}
                case 'roominfo':
                    let info = JSON.parse(data[1]);
                    let cards = [];
                    info.user.cards.forEach((element, index) => {
                        cards.push(cloneCard(element));
                    });
                    info.user.cards = cards;
                    gameVue.session.user = info.user;
                    let oppos = {};
                    for (let op of info.opponents) {
                        cards = [];
                        op.cards.forEach((element, index) => {
                            cards.push(cloneCard(element));
                        });
                        op.cards = cards;
                        oppos[op.name] = op;
                    }
                    gameVue.session.players = oppos;
                    gameVue.currentActive = info.currentActive;
                    gameVue.session.remainWhite = info.whiteRemain;
                    gameVue.session.remainBlack = info.blackRemain;
                    gameVue.picked = info.picked;
                    if (gameVue.session.state !== info.state && info.state === STATES.PLAYING) {
                        gameVue.session.state = info.state; 
                        $.bootstrapGrowl('Game Start!');
                    } else if (gameVue.session.state === STATES.PLAYING && data[1] !== this.prevMsg) {
                        $.bootstrapGrowl('Move!');
                        this.prevMsg = data[1];
                    }
                    if (info.state === STATES.ENDED) {
                        let winner = "";
                        if (info.user.state === STATES.PLAYING) {
                            winner = info.user.name;
                        } else {
                            for (let op of info.opponents) {
                                if (op.state === STATES.PLAYING) {
                                    winner = op.name;
                                    break;
                                }
                            }
                        }
                        bootbox.alert('Game Over! Winner is ' + winner);
                    }
                    break;
                case 'fail':
                    bootbox.alert(data[1]);
                    break;
            }
        } 
    }
    getNewRoomNum() {
        this.connection.send("getNewRoom");
    }
    getRoomList() {
        this.connection.send("getRoomList");
    }
    joinRoom(username, roomID) {
        //joinRoom&&username&&roomID
        this.connection.send(`joinRoom&&${username}&&${roomID}`);
    }
    getRoomInfo(username, roomID) {
        //getRoomInfo&&username&&roomID
        this.connection.send(`getRoomInfo&&${username}&&${roomID}`);
    }
    playerGetReady(username, roomID) {
        //playerReady&&username&&roomID
        this.connection.send(`playerReady&&${username}&&${roomID}`)
    }
    playerPick(user, roomID, color) {
        //playerPick&&username&&roomID&&pickColor
        this.connection.send(`playerPick&&${user}&&${roomID}&&${color}`);
    }
    playerGuess(user, roomID, targetUser, targetIndex, guessNum) {
        //playerGuess&&username&&roomID&&targetUser&&cardIndex&&guessNum
        this.connection.send(`playerGuess&&${user}&&${roomID}&&${targetUser}&&${targetIndex}&&${guessNum}`);
    }
    swapCard(user, roomID, index) {
        //swapCard&&username&&roomID&&cardIndex
        this.connection.send(`swapCard&&${user}&&${roomID}&&${index}`);
    }
}