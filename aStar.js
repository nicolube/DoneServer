import fs from "fs"
import { MinQueue } from "heapify/heapify.mjs";

var mapData = JSON.parse(fs.readFileSync("map.json"));


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
    },
    round: (a, b) => {
        a.x = Math.round(b.x);
        a.y = Math.round(b.y);
        a.z = Math.round(b.z);
    }
}


var open = new MinQueue()
var closed = []
var data = []
const aStar = (start, end) => {
    const startPoint = mapData[start]
    var startData = {
        name: start,
        id: 0,
        parent: null,
        distance: 0
    };
    closed.push(start);
    data.push(startData)
    var r = run(startData, end)
    const result = []
    while (r)  {
        result.push(r.name)
        r = data[r.parent]
    } 
    return result
}

const run = (parent, end) => {
    const endPoint = mapData[end]
    while (true) {
        var parentPoint = mapData[parent.name];
        for (const sel in parentPoint.connected) {
            const d = parentPoint.connected[sel];
            const selPoint = mapData[sel];
            if (data.filter(d => d.name == sel).length > 0) continue;
            const selData = {
                name: sel,
                parent: parent.id,
                distance: parent.distance + d
            }
            if (sel == end) return selData;
            selData.id = data.push(selData)-1;
            open.push(selData.id, vector.distance(selPoint, endPoint) + selData.distance);
        }
        if (open.size <= 0) return "Fail" 
        parent = data[open.pop()];
        closed.push(parent.name);
    }
}

//console.log(aStar("dev-dev", "watame-r01"));
//console.log(aStar("watame-r14", "dev-dev"));
console.log(aStar("watame-r14", "watame-r10"));

