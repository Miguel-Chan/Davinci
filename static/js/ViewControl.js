$(document).ready(function() {

})

const STATES = {
    READY = 0,
    PLAYING = 1,
    ENDED = 2
};

class RoomInfo {
    constructor(id, players, state) {
        this.playersList = players;
        this.id = id;
        this.state = state;
    }
}

let initialVue = new initialVue({
    el: '#choosing-ground',
    data: {
        room: "",
        usre: "",
        roomsList: [],
        waiting: true
    },
    methods: {
        
    }
})
