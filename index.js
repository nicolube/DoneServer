// Include Nodejs' net module.
const Net = require('net');
const readline = require('readline');
const fs = require('fs');
const api = require('./api')

/*
    File fuctions
*/
function loadDoneFile() {
    const drones = fs.readFileSync("drones.json");
    for (k in drones) {
        drones[k].connected = false;
    }
    return drones
}

function saveDroneFile() {
    fs.writeFileSync("drones.json", JSON.stringify(drones, null, 2))
}

var mapData = JSON.parse(fs.readFileSync("map.json"));

var drones = JSON.parse(loadDoneFile());



var droneSockets = {}

api.setMap(mapData);
api.setDrones(drones);

const status = {
    IDLE: 0,
    MOVING: 1,
    FINISHED_MOVE: 2,
}

const vector = {

    distance: (a, b) => {
        const c = vector.subtract(a, b);
        return Math.sqrt(c.x * c.x + c.y * c.y + c.z * c.z)
    },

    add: (a, b) => {
        return {
            x: (a.x + b.x),
            y: (a.y + b.y),
            z: (a.z + b.z),
        };
    },

    subtract: (a, b) => {
        return {
            x: (a.x - b.x),
            y: (a.y - b.y),
            z: (a.z - b.z),
        };
    },
    set: (a, b) => {
        a.x = b.x;
        a.y = b.y;
        a.z = b.z;
    }
}



function findPath(start, target) {
    var dist = 0
    var visited = []
    var stack = []
    function find(s, e) {
        visited.push(s)
        if (s == e) {
            stack.push(e);
            stack.shift();
            return stack
        }
        const a = mapData[s]
        const b = mapData[e]
        var d;
        var lp
        for (p in a.connected) {
            const c = mapData[p];
            const cd = vector.distance(b, c);
            if (d == undefined || d > cd) {
                if (!visited.includes(p)) {
                    d = cd;
                    lp = p;
                }
            }
        }
        if (d == undefined)
            return find(stack.pop(), e)
        stack.push(s);
        return find(lp, e)
    }
    return {
        path: find(start, target),
        distance: dist
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function moveDrone(drone, target) {
    const start = drone.targetPoint;
    console.log(`${start} -> ${target}`)
    path = findPath(start, target);
    drone.path = path["path"];
    var dist = mapData[start].connected[drone.path[0]]
    for (let i = 1; i < drone.path.length; i++) {
        const p = drone.path[i];
        dist += mapData[drone.path[i]].connected[drone.path[i - 1]]
    }
    console.log(`Drone moves to ${target} -> ${dist.toFixed(2)}m`)
    if (drone.status == status.IDLE)
        drone.status = status.FINISHED_MOVE
}

setInterval(() => {
    for (const [uuid, drone] of Object.entries(drones)) {
        if (!drone.connected) return;
        switch (drone.status) {
            case status.FINISHED_MOVE:
                drone.point = drone.targetPoint;
                if (drone.path.length == 0) {
                    drone.status = status.IDLE;
                    break
                }
                drone.targetPoint = drone.path.shift();
                saveDroneFile()
                console.log("Move to: " + drone.targetPoint)
                const target = mapData[drone.targetPoint];
                const x = target.x - mapData[drone.point].x;
                const y = target.y - mapData[drone.point].y;
                const z = target.z - mapData[drone.point].z;
                drone.offset = 20
                droneSockets[uuid].write(`drone.move(${x}, ${y}, ${z})\n`);
                drone.status = status.MOVING
                break
            case status.MOVING:
                if (drone["offset"] > 0.8) {
                    droneSockets[uuid].write(`return "$OFFSET:"..drone.getOffset()\n`)
                }
                else
                    drone.status = status.FINISHED_MOVE
                break
            case status.IDLE:
                break
        }
    };
}, 1000)

setInterval(() => {
    for (const [uuid, drone] of Object.entries(drones)) {
        if (!drone.connected) return;
        droneSockets[uuid].write(`return "$ENERGY:"..computer.energy()/computer.maxEnergy()\n`)
    };
}, 5000)

const server = new Net.Server();
const port = 8080;
server.listen(port, function () {
    console.log(`Server listening for connection requests on socket localhost:${port}.`);
});

server.on('connection', function (socket) {
    console.log('A new connection has been established.');
    socket.write(`return "$UUID:"..component.list("modem")()\n`)
    var uuid = ""
    socket.on('data', function (chunk) {
        const data = chunk.toString();
        if (data.startsWith("$UUID:")) {
            uuid = data.substring(6, data.length - 1)
            sel = uuid
            droneSockets[uuid] = socket
            if (uuid in drones) {
                drones[uuid].connected = true;
            } else {
                drones[uuid] = {
                    connected: true,
                    point: "dev-dev",
                    targetPoint: "dev-dev",
                    lastLocation: {
                        x: 0,
                        y: 0,
                        z: 0,
                    },
                    offset: 0,
                    energy: 0,
                    path: [],
                    status: status.IDLE
                }
            }
            console.log("Drone registered: " + uuid);
            return
        }
        if (data.startsWith("$OFFSET:") && drones[uuid].status == status.MOVING) {
            drones[uuid].offset = parseFloat(data.substring(8, data.length - 1))
            return
        }
        if (data.startsWith("$ENERGY:")) {
            drones[uuid].energy = parseFloat(data.substring(8, data.length - 1))
            return
        }
        if (uuid == sel)
            console.log(data)
    });

    socket.on('end', function () {
        if (uuid == "") {
            console.log("Unknown device disonected!");
            return
        }
        console.log('Drone disconnected: ' + uuid);
        drones[uuid].connected = false;
        delete droneSockets[uuid];
    });

    socket.on('error', function (err) {
        console.log(`Error (${uuid}): ${err}`);
    });
});


var sel = ""

const commands = {
    load: {
        description: "Loads a saved map.",
        syntax: "<name>",
        exe: (args) => {
            const name = args[0].toLowerCase() + ".json";
            if (!fs.existsSync(name)) {
                console.error("File not found!")
                return
            }
            load(name)
        }
    },
    list: {
        exe: (args) => {
            console.log("Connected drones: ")
            const connected = []
            for (k in drones) if (drones[k].connected) connected.push(k)
            if (connected.length <= 0) {
                console.log("No drones connected")
                return
            }
            for (i in connected) {
                const uuid = connected[i]
                console.log(`${uuid} -> ${drones[uuid].targetPoint}`)
            }
        }
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.on("line", (input) => {
    const args = input.trim().split(" ")
    const cmd = args.shift().toLowerCase();

    if (cmd in commands) {
        if (commands[cmd].syntax != null && args.length < commands[cmd].syntax.split(" ").length) {
            console.log("Invalid syntax")
            logHelp(cmd)
            return
        }
        try {
            commands[cmd].exe(args)
        } catch (e) {
            console.log(e)
        }
        return
    }
    console.log(`Command not found fly "help" for cmd list`);

    switch (cmd) {
        case "sel":
            if (args[0] in drones) {
                sel = args[0]
                console.log(`Drone ${sel} selceted!`)
                break
            }
            console.error(); ("Drone not found")
            for (k in drones) {
                console.log(k)
            }
            break
        case "exe":
            const exe = args.join(" ")
            if (drones[sel] == null) {
                console.error(`Cannot execute on ${sel} try "list" / "sel <uuid>"`)
                break
            }
            droneSockets[sel].write(exe + "\n")
            console.log("exe: " + exe)
            break
        case "move":
            const point = args[0].toLowerCase()
            if (!(point in mapData)) {
                console.error(`Taget point ${point} not found!`);
                break
            }
            if (drones[sel] == null) {
                console.error(`Cannot execute on ${sel} try "list" / "sel <uuid>"`)
                break
            }
            moveDrone(drones[sel], point)
            break
        case "offset":
            console.log("Drone offset: " + drones[sel].offset);
            break
    }
});

[`SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`].forEach((eventType) => {
    process.on(eventType, () => {
        for (k in droneSockets) {
            if (!droneSockets[k]) return
            droneSockets[k].end()
        }
        for (k in drones) {
            drones[k].connected = false;
        }
        api.server.close();
        server.close();
        console.log("Exit " + eventType);
        saveDroneFile()
        process.exit();
    });
});