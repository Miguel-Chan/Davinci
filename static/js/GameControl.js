const STATES = {
    READY: 0,
    PLAYING: 1,
    ENDED: 2
};

const COLOR = {
    BLACK: "dark",
    WHITE: "light"
}

const cardSet =
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '-'];

function cloneCard(that) {
    return new Card(that.content, that.color);
}

class Card {
    constructor(content, color) {
        this.content = content;
        this.color = color;
    }
    get covered() {
        return this.content.indexOf('<') !== -1;
    }
    cover() {
        this.content = '<';
    }
    uncover(num) {
        this.content = num;
    }
    toBootstrapClass() {
        return 'btn-' + this.color;
    }
}

class User {
    constructor(name, state) {
        this.name = name;
        this.cards = [];
        // for (let i = 0; i < 5; i++) {
        //     this.cards.push(new Card(i, COLOR.BLACK));
        //     this.cards.push(new Card(i + 9, COLOR.WHITE));
        // }
        // this.cards[2].cover();
        this.state = state;
    }
    addCard(card) {
        this.cards.push(card);
    }
    get dead() {
        for (let card of this.cards) {
            if (card.covered) return false;
        }
        return true;
    }
}


class GameSession {
    constructor(playerName) {
        this.user = new User(playerName);
        this.players = {};
        this.state = STATES.READY;
        this.remainBlack = 10;
        this.remainWhite = 8;
    }
    addPlayer(newPlayer) {
        this.players[newPlayer.name] = newPlayer;
    }
    
}