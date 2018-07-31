const STATES = {
    READY: 0,
    PLAYING: 1,
    ENDED: 2
};

module.exports = {
    GameSession: class GameSession {
        constructor(id) {
            this.players = [];
            this.user = null;
            this.sessionID = id;
            this.state = STATES.READY;
        }
        addPlayer(newPlayer) {
            players.append(newPlayer);
        }
        setUser(user) {
            this.user = user;
        }
    
        
    },
    STATES: STATES
}