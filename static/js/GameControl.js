const STATES = {
    READY: 0,
    PLAYING: 1,
    ENDED: 2
};

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