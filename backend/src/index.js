// Include Nodejs' net module.
import readline from "readline";

import * as api from "./api.js";
import { UserCollection } from "./database/database.js";
var sel = ""

const commands = {

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