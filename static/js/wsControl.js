function isHttps() {
    return window.location.protocol === "https:";
}

function getWsPrefix() {
    return isHttps() ? "wss://" : "ws://"; 
}

class DavinciWsController {
    constructor() {
        this.connection = new WebSocket(getWsPrefix() + window.location.host);
        this.connection.onclose = function() {
            bootbox.alert("Connection Lost! Please reconnect by flashing the page.");
        }
        this.connection.onerror = function() {
            bootbox.alert("Connection Error! Please reconnect by flashing the page.");
        }
        this.connection.onmessage = function(recData) {
            let msg = recData.data;
            let data = msg.split("||");
            console.log(msg);
            switch(data[0].toLocaleLowerCase()) {
                //newRoomNum||{roomID}
                case 'newroomnum':
                    initialVue.setNewRoomNumber(data[1]);
                    break;
            }
        } 
    }
    getNewRoomNum() {
        this.connection.send("getNewRoom");
    }
}