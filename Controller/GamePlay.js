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
    }
    addCard(card) {
        this.cards.push(card);
    }
}



module.exports = {
    GameSession: class GameSession {
        constructor(id) {
            this.players = [];
            this.usersInfo = [];
            this.sessionID = id;
            this.state = STATES.READY;
            this.whiteDeck = copyArray(cardSet);
            this.blackDeck = copyArray(cardSet);
        }
        addPlayer(newPlayer) {
            this.players.push(newPlayer);
            this.usersInfo.push(new UserInfo(newPlayer));
        }

        // @param: username: the user querying the data.
        toInfoString(username) {
            if (username in this.players) {
                let permittedData = {
                    whiteRemain: this.whiteDeck.length,
                    blackRemain: this.blackDeck.length,
                };
                for (info of this.usersInfo) {

                }
                return {
                    code: 1,
                    data: JSON.stringify(permittedData)
                };
            }
            else {
                return {
                    code: 0,
                    errMsg: 'User is not in the requested session!'
                };
            }
        }
        
    },
    STATES: STATES
}