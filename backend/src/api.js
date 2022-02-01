import express from "express"
import fs from "fs"
import cors from "cors"
import { authenticateUser } from "./lib.js"
const app = express()
app.use(cors())
app.use(express.json())

const port = 3002

var map = {};
var drones = {};

const checkAuthentication = async (username, password, res, next) => {
    if (password === undefined || username === undefined) {
        res.sendStatus(401);
        return
    }
    if (!verify.username(username) || !verify.password(password)) {
        res.sendStatus(400);
        return
    }
    if (!await authenticateUser(username, password)) {
        res.sendStatus(403);
        return
    }
    next();
};


const verify = {
    username: (value) => value.match(/^[\d\w-]{4,24}$/g) !== null,
    password: (value) => value.match(/^[\d\w-?$/!"'+*§]{8,32}$/g) !== null,
}

app.post("/api/user/login", async (req, res) => {
    await checkAuthentication(req.body.username, req.body.password, res, () => res.sendStatus(200));
});

app.get("/api/assets/img/map/index", (req, res) => {
    res.send(fs.readdirSync("assets/img/map").map(e => e.split('.')[0]));
});

app.use('/api/assets/img/map', express.static('assets/img/map'));

app.get('/api/map', (req, res) => {
    res.send(map)
});

app.get('/api/drones', (req, res) => {
    res.send(drones)
});

const securedApp = app.route("/api/secured")
    .all(async (req, res, next) => { await checkAuthentication(req.get("username"), req.get("password"), res, next) })
    .get((req, res) => {
        res.send("Hello World")
    })

export const server = app.listen(port, "0.0.0.0", () => {
    console.log(`API is listening on http://127.0.0.1:${port}`)
})