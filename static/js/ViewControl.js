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
            room = newNum;
        }
    }
})

let gameVue = new Vue ({
    el: '#game-area',
    data: {
        gaming: false
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