import { MinQueue } from "heapify/heapify.mjs";
import { vector } from "./lib.js";

export const aStar = (mapData, start, end) => {
    var open = new MinQueue()
    var closed = []
    var data = []
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
                selData.id = data.push(selData) - 1;
                open.push(selData.id, vector.distance(selPoint, endPoint) + selData.distance);
            }
            if (open.size <= 0) return "Fail"
            parent = data[open.pop()];
            closed.push(parent.name);
        }
    }
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
    const distance = r.distance
    const result = []
    while (r) {
        result.push(r.name)
        r = data[r.parent]
    }
    return { path: result,
        distance: distance
     }
}

