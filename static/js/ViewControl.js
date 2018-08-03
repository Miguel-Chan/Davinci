let WsControl;
$(document).ready(function() {
    WsControl = new DavinciWsController();
})

class RoomInfo {
    constructor(id, players, state) {
        this.playersList = players;
        this.id = id;
        this.state = state;
    }
}

const asciiArt = "________              .__              .__  \n\
\\______ \\ _____ ___  _|__| ____   ____ |__|\n\
 |    |  \\\\__  \\\\  \\/ /  |/    \\_/ ___\\|  |\n\
 |    `   \\/ __ \\\\   /|  |   |  \\  \\___|  |\n\
/_______  (____  /\\_/ |__|___|  /\\___  >__|\n\
        \\/     \\/             \\/     \\/    ";


let initialVue = new Vue({
    el: '#choosing-ground',
    data: {
        room: "",
        user: "",
        roomsList: [],
        waiting: true
    },
    methods: {
        sendNewRoomRequest() {
            WsControl.getNewRoomNum();
        },
        setNewRoomNumber(newNum) {
            this.room = newNum;
        },
        joinRoom() {
            if (this.user.length === 0 || this.user.indexOf('&') !== -1) {
                bootbox.alert('Please enter a valid username!');
                return;
            }
            if (this.room.length === 0 || this.room.indexOf('&') !== -1) {
                bootbox.alert('Room number is invalid!');
                return;
            }
            if (this.user.length > 7) {
                bootbox.alert('Username should not be longer than 7 characters.');
                return;
            }
            //TODO: Check if the room exists.

            startGame();
        }
    }
})

let gameVue = new Vue ({
    el: '#game-area',
    data: {
        gaming: false,
        session: null,
        user: null,
        room: null,
        currentActive: null
    },
    methods: {
        isActive(name) {
            return name === this.currentActive;
        }
    }
})

function startGame() {
    initialVue.waiting = false;
    gameVue.gaming = true;
    gameVue.user = initialVue.user;
    gameVue.session = new GameSession(gameVue.user);
    gameVue.room = initialVue.room;
    let opponents = [new User('asd'), new User('123'), new User('ooo')];
    for (let u of opponents)
        gameVue.session.addPlayer(u);
}

function endGame() {
    initialVue.waiting = true;
    gameVue.gaming = false;
}

console.log(asciiArt);