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
        insertIntoDeck(this.cards, card);
    }
}

function insertIntoDeck(deck, card) {
    for (let i = 0; i < deck.length; i++) {
        if ((card.num === '-' && Math.random() > 0.7) ||
         (!isNaN(parseInt(deck[i].num)) && !isNaN(parseInt(card.num)) 
         && parseInt(deck[i].num) >= parseInt(card.num))) {
            deck.splice(i, 0, card);
            return;
        }
    }
    deck.splice(deck.length, 0, card);
}


module.exports = {
    GameSession: class GameSession {
        constructor(id) {
            this.players = [];
            this.usersInfo = {};
            this.sessionID = id;
            this.state = STATES.READY;
            this.currentPlayerIndex = null;
            this.whiteDeck = copyArray(cardSet);
            this.blackDeck = copyArray(cardSet);
            this.picked = false;
            this.pendingCard = null;
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
                permittedData.state = this.state;
                permittedData.currentActive = this.currentPlayer;
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
                            if (this.pendingCard.color === card.color &&
                                this.pendingCard.content === card.content) {
                                infoCard.content = infoCard.content + "?";
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
                            oppoInfo.cards.push(infoCard);
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
                if (this.usersInfo[p].readyState !== STATES.PLAYING) {
                    startFlag = false;
                    break;
                }
            }
            if (startFlag && this.players.length >= 2) {
                this.startGame();
            }
        }
        get currentPlayer() {
            return this.players[this.currentPlayerIndex];
        }
        startGame() {
            this.state = STATES.PLAYING;
            this.currentPlayerIndex = Math.floor(Math.random() * this.players.length);
            this.picked = false;
            this.shuffleCard();
        }
        shuffleCard() {
            let initCount = this.players.length === 4 ? 3 : 4;
            for (let u in this.usersInfo) {
                for (let i = 0; i < initCount; i++) {
                    this.usersInfo[u].addCard(this.getRandomCard());
                }
            }
        }
        getRandomCard() {
            let cNum = Math.floor(Math.random() * 2);
            if (cNum < 1) {
                //black
                let index = Math.floor(Math.random() * this.blackDeck.length);
                let content = this.blackDeck[index];
                this.blackDeck.splice(content, 1);
                return new Card('dark', content);
            } else {
                //white
                let index = Math.floor(Math.random() * this.whiteDeck.length);
                let content = this.whiteDeck[index];
                this.whiteDeck.splice(content, 1);
                return new Card('light', content);
            }
        }
        playerPick(username, color) {
            if (username !== this.currentPlayer) {
                throw Error('Wrong Player!');
            }
            if (color === 'dark') {
                if (this.blackDeck.length === 0) {
                    throw Error('Empty black deck!');
                }
                let index = Math.floor(Math.random() * this.blackDeck.length);
                let content = this.blackDeck[index];
                this.blackDeck.splice(content, 1);
                let newCard = new Card("dark", content);
                this.usersInfo.addCard(newCard);
            } else if (color === 'light') {
                if (this.whiteDeck.length === 0) {
                    throw Error('Empty white deck!');
                }
                let index = Math.floor(Math.random() * this.whiteDeck.length);
                let content = this.whiteDeck[index];
                this.whiteDeck.splice(content, 1);
                let newCard = new Card("light", content);
                this.usersInfo.addCard(newCard);
            }
        }
    },
    STATES: STATES
}