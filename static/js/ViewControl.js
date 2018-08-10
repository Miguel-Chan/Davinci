let WsControl;
$(document).ready(function initList() {
  try {
    WsControl.getRoomList();
  } catch(any) {
    setTimeout(initList, 500);
  }
})

WsControl = new DavinciWsController();

class RoomInfo {
  constructor(id, players, state) {
    this.playersList = players;
    this.id = id;
    this.state = state;
  }
}

//Constant Data
const asciiArt = '________              .__              .__  \n\
\\______ \\ _____ ___  _|__| ____   ____ |__|\n\
 |    |  \\\\__  \\\\  \\/ /  |/    \\_/ ___\\|  |\n\
 |    `   \\/ __ \\\\   /|  |   |  \\  \\___|  |\n\
/_______  (____  /\\_/ |__|___|  /\\___  >__|\n\
        \\/     \\/             \\/     \\/    ';
const popularNames = ["Allison","Arthur","Ana","Alex","Arlene","Alberto","Barry","Bertha","Bill","Bonnie","Bret","Beryl","Chantal","Charley","Cindy","Chris","Dean","Dolly","Danny","Dennis","Debby","Erin","Edouard","Erika","Earl","Emily","Ernesto","Felix","Fay","Fabian","Frances","Gustav","Grace","Gaston","Gert","Gordon","Hanna","Henri","Hermine","Harvey","Helene","Iris","Isidore","Isabel","Ivan","Irene","Isaac","Jerry","Juan","Jeanne","Jose","Joyce","Karen","Kyle","Kate","Karl","Katrina","Kirk","Lorenzo","Lili","Larry","Lisa","Lee","Leslie","Marco","Mindy","Maria","Michael","Noel","Nana","Nicole","Nate","Nadine","Olga","Omar","Odette","Otto","Ophelia","Oscar","Pablo","Paloma","Peter","Paula","Patty","Rebekah","Rene","Rose","Richard","Rita","Rafael","Sally","Sam","Shary","Stan","Sandy","Tanya","Teddy","Teresa","Tomas","Tammy","Tony","Van","Vicky","Victor","Vince","Valerie","Wendy","Wilfred","Wanda","Walter","Wilma","William","Kumiko","Aki","Miharu","Chiaki","Michiyo","Miguel","Mig","Itoe","Nanaho","Reina","Emi","Yumi","Ayumi","Kaori","Sayuri","Rie","Miyuki","Hitomi","Naoko","Miwa","Etsuko","Akane","Kazuko","Miyako","Youko","Sachiko","Mieko","Toshie","Junko"]


let initialVue = new Vue({
  el: '#choosing-ground',
  data: {
    room: '',
    user: '',
    roomsList: [],
    waiting: true,
    creating: false,
    popNames: popularNames
  },
  created: function() {

  },
  methods: {
    sendNewRoomRequest() {
      WsControl.getNewRoomNum();
    },
    setNewRoomNumber(newNum) {
      this.room = newNum;
      this.roomsList.push(newNum);
      if (this.creating) {
        this.confirmNewRoom();
      }
    },
    setRoomNumber(num) {
      this.room = num;
    },
    setRoomList(roomArr) {
      this.roomsList = roomArr;
    },
    confirmNewRoom() {
      bootbox.confirm({
        title: 'New Room',
        message: `Room Number: ${this.room}. Enter?`,
        buttons: {
          cancel: {label: '<i class="fa fa-times"></i> Cancel'},
          confirm: {label: '<i class="fa fa-check"></i> Confirm'}
        },
        callback: function(res) {
          if (res) {
            initialVue.joinRoom();
          }
        }
      });
    },
    createAndJoin() {
      if (this.user.length === 0 || this.user.indexOf('&') !== -1 ||
          this.user.indexOf('&') !== -1) {
        bootbox.alert('Please enter a valid username!');
        return;
      }
      if (this.user.length > 7) {
        bootbox.alert('Username should not be longer than 7 characters.');
        return;
      }
      this.creating = true;
      this.sendNewRoomRequest();
    },
    joinRoom() {
      if (this.user.length === 0 || this.user.indexOf('&') !== -1 ||
          this.user.indexOf('|') !== -1) {
        bootbox.alert('Please enter a valid username!');
        return;
      }
      if (this.room.length === 0 || this.room.indexOf('&') !== -1 ||
          this.room.indexOf('|') !== -1) {
        bootbox.alert('Room number is invalid!');
        return;
      }
      if (this.user.length > 7) {
        bootbox.alert('Username should not be longer than 7 characters.');
        return;
      }
      WsControl.joinRoom(this.user, this.room);
    }
  }
})

let gameVue = new Vue({
  el: '#game-area',
  data: {
    gaming: false,
    session: null,
    user: null,
    room: null,
    currentActive: null,
    picked: false
  },
  computed: {
    hasStarted: function() {
      return this.session.state === STATES.PLAYING;
    },
    userCards: function() {
      if (this.session.state === STATES.READY) {
        return [new Card('Ready', 'light')];
      } else {
        return this.session.user.cards;
      }
    }
  },
  methods: {
    isActive(name) {
      if (this.session.state === STATES.PLAYING) {
        return name === this.currentActive;
      } else if (this.session.state === STATES.READY) {
        if (name === this.user) {
          return this.session.user.state === STATES.PLAYING;
        }
        return this.session.players[name].state === STATES.PLAYING;
      } else {
        return false;
      }
    },
    clickOnSelfCard(clickedCardIndex) {
      let cards = this.session.user.cards;
      // Check if the index is invalid.
      if (this.session.state === STATES.READY) {
        if (this.session.user.state === STATES.READY) {
          WsControl.playerGetReady(this.user, this.room);
        } else {
          bootbox.alert('Player is already ready!');
        }
      } else if (clickedCardIndex < 0 || clickedCardIndex >= cards.length) {
        bootbox.alert('Error: clicked card not found!');
      } else {
        WsControl.swapCard(this.user, this.room, clickedCardIndex);
      }
    },
    setPlayerReady(username) {
      if (this.user === username) {
        this.session.user.state = STATES.PLAYING;
      } else if (username in this.session.players) {
        this.session.players[username].state = STATES.PLAYING;
      } else {
        bootbox.alert('Invalid user passed to setPlayerReady()');
      }
    },
    clickOnRemainCard(color) {
      if (this.session.state !== STATES.PLAYING) {
        bootbox.alert('The game has not yet started!');
      } else if (this.session.user.name !== this.currentActive) {
        $.bootstrapGrowl('It\'s not your turn!');
      } else if (this.picked) {
        $.bootstrapGrowl('You have already picked a remaining card!');
      } else {
        WsControl.playerPick(this.user, this.room, color);
      }
    },
    makeGuess(targetUser, cardIndex) {
      if (this.session.state !== STATES.PLAYING) {
        bootbox.alert('The game has not yet started!');
        return;
      } else if (this.session.user.name !== this.currentActive) {
        $.bootstrapGrowl('It\'s not your turn!');
        return;
      } else if (!this.picked) {
        $.bootstrapGrowl('You should first picked a remaining card!');
        return;
      }
      let targetCard = targetUser.cards[cardIndex];
      if (targetCard.content.indexOf("<") === -1) {
        $.bootstrapGrowl('This card has already been uncovered!');
        return;
      }
      //Find possible card num
      let possibleSet = cardSet.slice();
      //Rules out all user's card.
      for (let card of this.session.user.cards) {
        if (card.color === targetCard.color) {
          let content = card.content;
          content = content.replace(/[<?]+/, "");
          possibleSet.splice(possibleSet.indexOf(content), 1);
        }
      }
      //Rules out all opponents' known cards.
      for (let n in this.session.players) {
        let op = this.session.players[n];
        for (let card of op.cards) {
          if (card.color === targetCard.color && card.content !== "<") {
            possibleSet.splice(possibleSet.indexOf(card.content), 1);
          }
        }
      }
      let options = makeOptionsObj(possibleSet);
      bootbox.prompt({
        title: 'Choose your guess.',
        inputType: 'select',
        inputOptions: options,
        callback: function(res) {
          if (res) {
            WsControl.playerGuess(gameVue.user, gameVue.room, targetUser.name, cardIndex, res);
          }
        }
      })
    }
  }
})

function makeOptionsObj(data) {
  let res = [];
  for (let ele of data) {
    res.push({
      text: ele,
      value: ele
    });
  }
  return res;
}

function startGame() {
  initialVue.waiting = false;
  gameVue.gaming = true;
  gameVue.user = initialVue.user;
  gameVue.session = new GameSession(gameVue.user);
  gameVue.room = initialVue.room;
  // let opponents = [new User('asd'), new User('123'), new User('ooo')];
  // for (let u of opponents)
  //     gameVue.session.addPlayer(u);
  WsControl.getRoomInfo(gameVue.user, gameVue.room);
}

function endGame() {
  initialVue.waiting = true;
  gameVue.gaming = false;
}

console.log(asciiArt);