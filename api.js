const express = require('express')
const cors = require('cors');
const app = express()
app.use(cors());

const port = 3002

var map = {};
var drones = {};

function setMap(_map) {
    map = _map;
}
function setDrones(_drones) {
    drones = _drones;
}
app.get('/', (req, res) => {
    res.send("Hello world")
})

app.get('/map', (req, res) => {
    res.send(map)
})
app.get('/drones', (req, res) => {
    res.send(drones)
})

const server = app.listen(port, () => {
    console.log(`API is listening on ${port}`)
})

exports.setMap = setMap;
exports.setDrones = setDrones
exports.server = server