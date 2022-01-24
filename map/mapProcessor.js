const readline = require('readline');
const fs = require('fs');
const path = require('path');
const api = require('../api')

var mapData = {};
api.setMap(mapData);

function distance(a, b) {
    const x = a["x"] - b["x"];
    const y = a["y"] - b["y"];
    const z = a["z"] - b["z"];
    return Math.sqrt(x * x + y * y + z * z)
}

function validate(mapData) {
    console.log("Validate points...")
    for (p in mapData) {
        var data = mapData[p]

        for (op in data["connected"]) {
            if (!(op in mapData)) {
                console.error(`Point ${op} not found`)
                return
            }
            if (!(p in mapData[op]["connected"])) {
                console.error(`${p} not in ${op}`)
                return
            }
        }
    }
    console.log("Validation complete.")
}

function calcDistances(mapData) {

    console.log("Calulating distances...")
    for (p in mapData) {
        var data = mapData[p]

        for (op in data["connected"]) {
            data["connected"][op] = distance(data, mapData[op])
        }
    }
}

function connect(mapData, p1, p2) {
    const a = mapData[p1];
    const b = mapData[p2];
    const d = distance(a, b)
    a["connected"][p2] = d;
    b["connected"][p1] = d;
}

function disconnect(mapData, p1, p2) {
    const a = mapData[p1];
    const b = mapData[p2];
    delete a["connected"][p2];
    delete b["connected"][p1];
}

function deletePoint(mapData, p) {
    const a = mapData[p];
    for (op in a["connected"]) {
        delete mapData[op]["connected"][p]
    }
    delete mapData[p]
}

function load(name) {
    mapData = JSON.parse(fs.readFileSync(name))
    api.setMap(mapData);
}

function save(mapData, name) {
    fs.writeFileSync(name, JSON.stringify(mapData, null, 2))
}

function logHelp(cmd) {
    const syntax = commands[cmd]["syntax"];
    const description = commands[cmd]["description"];
    if (syntax == null)
        console.log(`${cmd} | ${description}`)
    else
        console.log(`${cmd} ${syntax} | ${description}`)
}

const commands = {
    "load": {
        description: "Loads a saved map.",
        syntax: "<name>",
        exe: (args) => {
            const name = args[0].toLowerCase()+".json";
            if (!fs.existsSync(name)) {
                console.error("File not found!")
                return
            }
            load(name)
        }
    },
    "save": {
        description: "Saves a map.",
        syntax: "<name>",
        exe: (args) => {
            const name = args[0].toLowerCase()+".json";
            save(mapData, name)
        }
    },
    "new": {
        description: "Creates a new empty map.",
        exe: (args) => {
            mapData = {}
            api.map = mapData;            
        }
    },
    "add": {
        description: "Adds point to map.",
        syntax: "<name> <x> <y> <z>",
        exe: (args) => {
            const name = args[0].toLowerCase()
            const x = parseInt(args[1])
            const y = parseInt(args[2])
            const z = parseInt(args[3])
            mapData[name] = {
                x: x,
                y: y,
                z: z,
                connected: {}
            }
        }
    },
    "addp": {
        description: "Adds point to map.",
        syntax: "<jorny point>",
        exe: (args) => {
            var data = args.join(" ").slice(1,-1).split(",")
            console.log(data);
            for (let i = 0; i < data.length; i++) {
                const rep = data[i].split(":")[0].replace(" ", "");
                data[i] = data[i].replace(rep, `"${rep}"`) 
            }
            data = JSON.parse(`{${data.join(",")}}`)
            mapData[data.name] = {
                x: data.x,
                y: data.y,
                z: data.z,
                connected: {}
            }
        }
    },
    "connect": {
        description: "Connects two dots",
        syntax: "<point> <point>",
        exe: (args) => {
            const p1 = args[0].toLowerCase();
            const p2 = args[1].toLowerCase();
            if (!(p1 in mapData && p2 in mapData)) {
                console.error(`${p1} or ${p1} not found!`);
            }
            connect(mapData, p1, p2)
        }
    },
    "disconnect": {
        description: "Disconnects two dots",
        syntax: "<point> <point>",
        exe: (args) => {
            const p1 = args[0].toLowerCase();
            const p2 = args[1].toLowerCase();
            if (!(p1 in mapData && p2 in mapData)) {
                console.error(`${p1} or ${p1} not found!`);
            }
            disconnect(mapData, p1, p2)
        }
    },
    "import": {
        description: "Imports Jornymap waypoints from folder.",
        syntax: "<path>",
        exe: (args) => {
            const root = args.join(" ");
            const files = fs.readdirSync(root);
            for (i in files) {
                const waypoint = JSON.parse(fs.readFileSync(path.join(root, files[i])));
                mapData[waypoint.name] = {
                    x: waypoint.x,
                    y: waypoint.y,
                    z: waypoint.z,
                    connected: {}
                }
            }
        }
    },
    "validate": {
        description: "Validates current map.",
        exe: (args) => {
            validate(mapData)
        }
    },
    "help": {
        description: "Lists all commands",
        exe: (args) => {
            console.log("List of commands:")
            for (cmd in commands) {
                logHelp(cmd)
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
});