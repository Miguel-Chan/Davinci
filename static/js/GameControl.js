const STATES = {
    READY: 0,
    PLAYING: 1,
    ENDED: 2
};

const COLOR = {
    BLACK: "dark",
    WHITE: "light"
}


class Card {
    constructor(num, color) {
        this.num = num;
        this.color = color;
        this.covered = true;
    }
    toBootstrapClass() {
        return 'btn-' + this.color;
    }
}

class User {
    constructor(name) {
        this.name = name;
        this.card = [];
        for (let i = 0; i < 5; i++) {
            this.card.push(new Card(i, COLOR.BLACK));
            this.card.push(new Card(i + 9, COLOR.WHITE));
        }
        this.card[2].covered = false;
    }
}

class GameSession {
    constructor(player) {
        this.players = [player];
        this.user = player;
        this.state = STATES.READY;
    }
    addPlayer(newPlayer) {
        players.append(newPlayer);
    }
    
}