const STATES = {
    READY: 0,
    PLAYING: 1,
    ENDED: 2
};

const cardSet = ["0", "1", "2", "3", "4", "5", "6",
             "7", "8", "9", "10", "11", "-"];

function copyArray(arr) {
    return arr.slice();
}

class Card {
    constructor(color, num) {
        this.color = color;
        this.num = num;
        this.covered = true;
    }
}
class UserInfo {
    constructor(username) {
        this.name = username;
        this.cards = [];
        this.readyState = STATES.READY
    }
    addCard(card) {
        this.cards.push(card);
    }
}



module.exports = {
    GameSession: class GameSession {
        constructor(id) {
            this.players = [];
            this.usersInfo = {};
            this.sessionID = id;
            this.state = STATES.READY;
            this.currentPlayer = null;
            this.whiteDeck = copyArray(cardSet);
            this.blackDeck = copyArray(cardSet);
        }
        addPlayer(newPlayer) {
            this.players.push(newPlayer);
            this.usersInfo[newPlayer] = new UserInfo(newPlayer);
        }

        // @param: username: the user querying the data.
        toInfoString(username) {
            if (this.players.includes(username)) {
                let permittedData = {
                    whiteRemain: this.whiteDeck.length,
                    blackRemain: this.blackDeck.length,
                };
                permittedData.user = null;
                permittedData.opponents = [];
                for (let u in this.usersInfo) {
                    let info = this.usersInfo[u];
                    if (info.name === username) {
                        let userInfo = {
                            name: info.name,
                            cards: [],
                            state: info.readyState
                        }
                        for (let card of info.cards) {
                            let infoCard = {
                                color: card.color,
                                content: card.num
                            };
                            if (card.covered) {
                                infoCard.content = infoCard.content + "<";
                            }
                            userInfo.cards.push(infoCard);
                        }
                        permittedData.user = userInfo;
                    } else {
                        let oppoInfo = {
                            name: info.name,
                            cards: [],
                            state: info.readyState
                        }
                        for (let card of info.cards) {
                            let infoCard = {
                                color: card.color,
                                content: card.covered ? "<" : card.num
                            };
                            userInfo.cards.push(infoCard);
                        }
                        permittedData.opponents.push(oppoInfo);
                    }
                }
                return JSON.stringify(permittedData);
            }
            else {
                throw Error('User is not in the game');
            }
        }
        playerReady(username) {
            this.usersInfo[username].readyState = STATES.PLAYING;
            //IF all players are ready, start the game.
            let startFlag = true;
            for (let p in this.usersInfo) {
                if (this.usersInfo[p] !== STATES.PLAYING) {
                    startFlag = false;
                    break;
                }
            }
            if (startFlag) {
                this.startGame();
            }
        }
        startGame() {

        }
    },
    STATES: STATES
}