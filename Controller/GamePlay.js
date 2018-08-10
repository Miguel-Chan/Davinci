const STATES = {
  READY: 0,
  PLAYING: 1,
  ENDED: 2
};

const cardSet =
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '-'];

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
        (!isNaN(parseInt(deck[i].num)) && !isNaN(parseInt(card.num)) &&
         parseInt(deck[i].num) >= parseInt(card.num))) {
      deck.splice(i, 0, card);
      return;
    }
  }
  deck.splice(deck.length, 0, card);
}


module.exports = {
  GameSession: class GameSession{
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

    get allPlayers() {
      let res = [];
      for (let u in this.usersInfo) {
        res.push(this.usersInfo[u].name);
      }
      return res;
    }

    // @param: username: the user querying the data.
    toInfoString(username) {
      if (this.allPlayers.includes(username)) {
        let permittedData = {
          whiteRemain: this.whiteDeck.length,
          blackRemain: this.blackDeck.length,
        };
        permittedData.user = null;
        permittedData.opponents = [];
        permittedData.state = this.state;
        permittedData.picked = this.picked;
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
              let infoCard = {color: card.color, content: card.num};
              if (card.covered) {
                infoCard.content = infoCard.content + '<';
              }
              if (this.pendingCard && this.pendingCard.color === card.color &&
                  this.pendingCard.num === card.num) {
                infoCard.content = infoCard.content + '?';
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
                content: card.covered ? '<' : card.num
              };
              oppoInfo.cards.push(infoCard);
            }
            permittedData.opponents.push(oppoInfo);
          }
        }
        return JSON.stringify(permittedData);
      } else {
        throw Error('User is not in the game');
      }
    } 
    
    playerReady(username) {
      this.usersInfo[username].readyState = STATES.PLAYING;
      // IF all players are ready, start the game.
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
        // black
        let index = Math.floor(Math.random() * this.blackDeck.length);
        let content = this.blackDeck[index];
        this.blackDeck.splice(index, 1);
        return new Card('dark', content);
      } else {
        // white
        let index = Math.floor(Math.random() * this.whiteDeck.length);
        let content = this.whiteDeck[index];
        this.whiteDeck.splice(index, 1);
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
        this.blackDeck.splice(index, 1);
        let newCard = new Card('dark', content);
        this.usersInfo[username].addCard(newCard);
        this.pendingCard = newCard;
        this.picked = true;
      } else if (color === 'light') {
        if (this.whiteDeck.length === 0) {
          throw Error('Empty white deck!');
        }
        let index = Math.floor(Math.random() * this.whiteDeck.length);
        let content = this.whiteDeck[index];
        this.whiteDeck.splice(index, 1);
        let newCard = new Card('light', content);
        this.usersInfo[username].addCard(newCard);
        this.pendingCard = newCard;
        this.picked = true;
      }
    }

    clearDeadUser() {
      for (let i in this.players) {
        let u = this.players[i];
        let deck = this.usersInfo[u].cards;
        let flag = true;
        for (let card of deck) {
          if (card.covered) {
            flag = false;
            break;
          }
        }
        if (flag) {
          this.usersInfo[u].readyState = STATES.ENDED;
          this.players.splice(i, 1);
        }
      }
    }

    guessCard(username, targetUsername, cardIndex, guessNum) {
      if (this.currentPlayer !== username) {
        throw Error('guessing User is not the current active user!');
      }
      let targetUser = this.usersInfo[targetUsername];
      let targetCard = targetUser.cards[cardIndex];
      if (targetCard.num === guessNum) {
        targetCard.covered = false;
        this.clearDeadUser();
      } else {
        this.pendingCard.covered = false;
      }
      this.pendingCard = null;
      if (this.blackDeck.length !== 0 || this.whiteDeck.length !== 0) {
        this.picked = false;
      }
      if (this.players.length === 1) {
        this.state = STATES.ENDED;
      }
      else {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      }
    }

    swapCard(username, index) {
      index = parseInt(index);
      if (this.usersInfo[username].cards.length - 1 <= index) {
        return;
      }
      let leftCard = this.usersInfo[username].cards[index];
      let rightCard = this.usersInfo[username].cards[index+1];
      if (leftCard.num === '-' || rightCard.num === '-' || 
          (parseInt(leftCard.num) >= parseInt(rightCard.num))) {
            let deck = this.usersInfo[username].cards;
            [deck[index], deck[index+1]] = [deck[index+1], deck[index]];
          }
    }
  },

  STATES: STATES
}