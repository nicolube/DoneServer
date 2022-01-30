// Include Nodejs' net module.
import Net from "net"
import readline from "readline"
import fs from "fs"
import * as api from "./api.js"
import { calcDronePosition, fileExists, loadDoneFile, loadMapData, saveDroneFile, vector } from "./lib.js";
import { aStar } from "./aStar.js";

var mapData = loadMapData();

var drones = loadDoneFile();

var droneSockets = {}

api.setMap(mapData);
api.setDrones(drones);

const status = {
    IDLE: 0,
    MOVING: 1,
    FINISHED_MOVE: 2,
}

function findPath(start, target) {
    const result = aStar(mapData, start, target)
    result.path.pop()
    return result
}

async function moveDrone(drone, target) {
    const start = drone.targetPoint;
    console.log(`${start} -> ${target}`)
    const path = findPath(start, target);
    drone.path = path["path"];
    console.log(`Drone moves to ${target} -> ${path.distance.toFixed(2)}m`)
    if (drone.status == status.IDLE)
        drone.status = status.FINISHED_MOVE
}

/**
 * Fast scheduler for robots and drones
 */

setInterval(() => {
    for (const [uuid, drone] of Object.entries(drones)) {
        if (!drone.connected) return;
        switch (drone.status) {
            case status.FINISHED_MOVE:
                {
                    drone.point = drone.targetPoint;
                    vector.set(drone.lastLocation, mapData[drone.point])
                    if (drone.path.length == 0) {
                        drone.status = status.IDLE;
                        break
                    }
                    drone.targetPoint = drone.path.pop();
                    saveDroneFile(drones)
                    const target = mapData[drone.targetPoint];
                    const x = target.x - mapData[drone.point].x;
                    const y = target.y - mapData[drone.point].y;
                    const z = target.z - mapData[drone.point].z;
                    drone.offset = 20
                    droneSockets[uuid].write(`drone.move(${x}, ${y}, ${z})\n`);
                    drone.status = status.MOVING
                }
                break
            case status.MOVING:
                {
                    if (drone["offset"] > 0.8) {
                        droneSockets[uuid].write(`return "$OFFSET:"..drone.getOffset()\n`)
                    }
                    else
                        drone.status = status.FINISHED_MOVE
                }
                break
            case status.IDLE:
                break
        }
    };
}, 1000)

/**
 * Slow scheduler for robots and drones
 */

setInterval(() => {
    for (const [uuid, drone] of Object.entries(drones)) {
        if (!drone.connected) return;
        droneSockets[uuid].write(`return "$ENERGY:"..computer.energy()/computer.maxEnergy()\n`)
    };
}, 5000)

/**
 * TCP Sever for Robots and drones
 */

const server = new Net.Server();
const port = 8080;
server.listen(port, function () {
    console.log(`Server listening for connection requests on socket localhost:${port}.`);
});
server.on('connection', function (socket) {
    console.log('A new connection has been established.');
    socket.write(`return "$UUID:"..modemAddr\n`)
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
                    point: "rimuru-dev",
                    targetPoint: "rimuru-dev",
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
            drones[uuid].lastLocation = calcDronePosition(mapData, drones[uuid])
            return
        }
        if (data.startsWith("$ENERGY:")) {
            drones[uuid].energy = parseFloat(data.substring(8, data.length - 1))
            return
        }
        if (data != "nil" && uuid == sel) {
            console.log(data);
        }
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
            if (!fileExists(name)) {
                console.error("File not found!")
                return
            }
            mapData = loadMapData(name)
            api.setMap(mapData)
        }
    },
    list: {
        description: "List all connected drones",
        exe: (args) => {
            console.log("Connected drones: ")
            const connected = []
            for (var k in drones) if (drones[k].connected) connected.push(k)
            if (connected.length <= 0) {
                console.log("No drones connected")
                return
            }
            for (var i in connected) {
                const uuid = connected[i]
                console.log(`${uuid} -> ${drones[uuid].targetPoint}`)
            }
        }
    },
    sel: {
        description: "Select and drone.",
        syntax: "<uuid>",
        exe: (args) => {
            if (args[0] in drones) {
                sel = args[0]
                console.log(`Drone ${sel} selceted!`)
                return
            }
            console.error(); ("Drone not found")
            for (var k in drones) {
                console.log(k)
            }
        }
    },
    unsel: {
        description: "Unselect a drone.",
        exe: (args) => {
            console.log(`Drone ${sel} unselected.`)
            sel = ""
        }
    },
    setpoint: {
        description: "Set the current point of an drone.",
        exe: (args) => {
            if (drones[sel] == null) {
                console.error(`Cannot execute on ${sel} try "list" / "sel <uuid>"`)
                return
            }
            const point = args[0].toLowerCase()
            if (!(point in mapData)) {
                console.error(`Taget point ${point} not found!`);
                return
            }
            drones[sel].targetPoint = point;
            drones[sel].point = point;
        }
    },
    exe: {
        description: "Execute lua code on seldected drone.",
        syntax: "<lua code>",
        exe: (args) => {
            const exe = args.join(" ")
            if (drones[sel] == null) {
                console.error(`Cannot execute on ${sel} try "list" / "sel <uuid>"`)
                return
            }
            droneSockets[sel].write(exe + "\n")
            console.log("exe: " + exe)
        }
    },
    move: {
        exe: (args) => {
            const point = args[0].toLowerCase()
            if (!(point in mapData)) {
                console.error(`Taget point ${point} not found!`);
                return
            }
            if (drones[sel] == null) {
                console.error(`Cannot execute on ${sel} try "list" / "sel <uuid>"`)
                return
            }
            moveDrone(drones[sel], point)
        }
    },
    move: {
        exe: (args) => {
            const point = args[0].toLowerCase()
            if (!(point in mapData)) {
                console.error(`Taget point ${point} not found!`);
                return
            }
            if (drones[sel] == null) {
                console.error(`Cannot execute on ${sel} try "list" / "sel <uuid>"`)
                return
            }
            moveDrone(drones[sel], point)
        }
    },
    offset: {

        exe: (args) => {
            if (drones[sel] == null) {
                console.error(`Cannot execute on ${sel} try "list" / "sel <uuid>"`)
                return
            }
            console.log("Drone offset: " + drones[sel].offset);
        }
    }

}

function logHelp(cmd) {
    const syntax = commands[cmd].syntax;
    const description = commands[cmd].description;
    if (syntax == null)
        console.log(`${cmd} | ${description}`)
    else
        console.log(`${cmd} ${syntax} | ${description}`)
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.on("line", (input) => {
    const args = input.trim().split(" ")
    const cmd = args.shift().toLowerCase();

    if (cmd in commands) {
        if (commands[cmd].syntax != null && args.length < commands[cmd].syntax.match(/[<>]/g).length/2) {
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
});


    [`SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`].forEach((eventType) => {
        process.on(eventType, () => {
            for (var k in droneSockets) {
                if (!droneSockets[k]) return
                droneSockets[k].end()
            }
            for (var k in drones) {
                drones[k].connected = false;
            }
            api.server.close();
            server.close();
            console.log("Exit " + eventType);
            saveDroneFile(drones)
            process.exit();
        });
    });