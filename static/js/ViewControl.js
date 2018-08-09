let WsControl;
$(document).ready(function() {
  WsControl.getRoomList();
})

WsControl = new DavinciWsController();

class RoomInfo {
  constructor(id, players, state) {
    this.playersList = players;
    this.id = id;
    this.state = state;
  }
}

const asciiArt = '________              .__              .__  \n\
\\______ \\ _____ ___  _|__| ____   ____ |__|\n\
 |    |  \\\\__  \\\\  \\/ /  |/    \\_/ ___\\|  |\n\
 |    `   \\/ __ \\\\   /|  |   |  \\  \\___|  |\n\
/_______  (____  /\\_/ |__|___|  /\\___  >__|\n\
        \\/     \\/             \\/     \\/    ';


let initialVue = new Vue({
  el: '#choosing-ground',
  data: {room: '', user: '', roomsList: [], waiting: true, creating: false},
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
      // TODO: Check if the room exists.
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
    currentActive: null
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
        // TODO: Swap Card position
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
      } else {
        WsControl.playerPick(this.user, this.room, color);
      }
    }
  }
})

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