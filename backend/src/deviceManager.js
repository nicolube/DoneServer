import fs from "fs"
import Net from "net"

const drones = []


const server = new Net.Server();
const port = 8080;

server.listen(port, function () {
    console.log(`Server listening for connection requests on socket localhost:${port}.`);
});
server.on('connection', function (socket) {
    console.log('A new connection has been established, request auth data');

    socket.on('data', function (chunk) {
        var data = chunk.toString()
        if (data.match(/^<\w{32}\/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}>$/g).length == 1) {
            var data = data.slice(1, -1).split("/");
            const secred = data[0];
            const uuid = data[1];
        } else {
            socket.destroy();
        }
    });

    socket.on('end', function () {
    });

    socket.on('error', function (err) {
    });
});
const AnswerType = {
    NONE: 0,
    OFFSET: 1,
    ENERGY: 2,
    UUID: 3
}

const AutoRequestTypes = [
    AnswerType.ENERGY,
    AnswerType.OFFSET
]

class Device {
    socket
    data
    awaiting = []

    constructor(_data, _stocket) {
        this.data = _data;
        this.socket = _stocket;
    }


    getUUID() {
        this.sendRequest("return uuid", AnswerType.UUID)
    }

    getEnergy() {
        this.sendRequest("return getEnergy()", AnswerType.ENERGY)
    }

    sendRequest = (code, type) => {
        if (this.awaiting.includes(type))
            if (AutoRequestTypes.includes(type))
                return
        this.awaiting.push(type)
        this.socket.write(`${code}§`)
    };
}

class Drone extends Device {


    handleAnswer = (data) => {
        const type = this.awaiting.shift();
        switch (type) {

        }
    };


}