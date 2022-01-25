import express from "express"
import cors from "cors"
const app = express()
app.use(cors());

const port = 3002

var map = {};
var drones = {};

export function setMap(_map) {
    map = _map;
}
export function setDrones(_drones) {
    drones = _drones;
}
app.use('/', express.static('public'));

app.get('/api/map', (req, res) => {
    res.send(map)
})
app.get('/api/drones', (req, res) => {
    res.send(drones)
})

export const server = app.listen(port, () => {
    console.log(`API is listening on ${port}`)
})