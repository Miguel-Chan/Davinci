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
            //TODO: Check if the room exists.

            startGame();
        }
    }
})

let gameVue = new Vue ({
    el: '#game-area',
    data: {
        gaming: false,
        opponents: [new User('asd'), new User('123'), new User('ooo')]
    }
})

function startGame() {
    initialVue.waiting = false;
    gameVue.gaming = true;
}

function endGame() {
    initialVue.waiting = true;
    gameVue.gaming = false;
}