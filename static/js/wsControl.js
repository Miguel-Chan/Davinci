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
            bootbox.alert("Connection Lost! Please reconnect by flushing the page.");
        }
        this.connection.onerror = function() {
            bootbox.alert("Connection Error! Please reconnect by flushing the page.");
        }
        this.connection.onmessage = function(recData) {
            let msg = recData.data;
            let data = msg.split("||");
            console.log(msg);
            let list = [];
            switch(data[0].toLocaleLowerCase()) {
                //newRoomNum||{roomID}
                case 'newroomnum':
                    initialVue.setNewRoomNumber(data[1]);
                    break;
                //roomList||{room}||{room}||...
                case 'roomlist':
                    for (let i = 1; i < data.length; i++) {
                        list.push(data[i]);
                    }
                    initialVue.setRoomList(list);
                    break;
            }
        } 
    }
    getNewRoomNum() {
        this.connection.send("getNewRoom");
    }
    getRoomList() {
        this.connection.send("getRoomList");
    }
    playerGetReady(username) {

    }
}