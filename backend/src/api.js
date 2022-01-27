import express from "express"
import fs from "fs"
import cors from "cors"
const app = express()
app.use(cors())

const port = 3002

var map = {};
var drones = {};

export function setMap(_map) {
    map = _map;
}
export function setDrones(_drones) {
    drones = _drones;
}
app.get("/api/assets/img/map/index",(req, res) => {
    res.send(fs.readdirSync("assets/img/map").map(e => e.split('.')[0]));
})
app.use('/api/assets/img/map', express.static('assets/img/map'));

app.get('/api/map', (req, res) => {
    res.send(map)
})
app.get('/api/drones', (req, res) => {
    res.send(drones)
})

export const server = app.listen(port, "0.0.0.0", () => {
    console.log(`API is listening on http://127.0.0.1:${port}`)
})