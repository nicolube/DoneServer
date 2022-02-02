import path from "path"
import fs from "fs"
import * as db from "./database/database.js"
import * as argon2 from "argon2"
const dataFolder = "data";

export const loadDoneFile = () => {
    const drones = JSON.parse(fs.readFileSync(path.join(dataFolder, "drones.json")));
    for (var k in drones) {
        drones[k].connected = false;
    }
    return drones
}

export const saveDroneFile = (drones) => {
    fs.writeFileSync(path.join(dataFolder, "drones.json"), JSON.stringify(drones, null, 2))
}

export const loadMapData = (name = "map.json") => {
    return JSON.parse(fs.readFileSync(path.join(dataFolder, name)))
}

export const saveMapData = (mapData, name = "map.json") => {
    fs.writeFileSync(path.join(dataFolder, name), JSON.stringify(mapData, null, 2))
}

export const fileExists = (name) => {
    return fs.existsSync(path.join(dataFolder, name))
}
export const vector = {

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
    round: (a) => {
        a.x = Math.round(a.x);
        a.y = Math.round(a.y);
        a.z = Math.round(a.z);
    }
}

export const calcDronePosition = (mapData, drone) => {
    const target = mapData[drone.targetPoint];
    if (drone.point == drone.targetPoint) return target
    const a = drone.offset / target.connected[drone.point]
    const vect = vector.subtract(mapData[drone.point], target)
    vect.x *= a;
    vect.y *= a;
    vect.z *= a;
    var pos = vector.add(target, vect);
    vector.round(pos)
    return pos
}


export const authenticateDevice = async (secred, uuid) => {
  const data = await db.SecredCollection.findOne({    
    uuid: uuid
  });
  if (data === null) return null;
  if (argon2.verify(data.secred, secred)) return null;
  return data.type;
};

export const authenticateUser = async (username, password) => {
    console.log(username);
    const user = await db.UserCollection.findOne({username: username})
    if (user === undefined) return false;
    return await argon2.verify(user.password, password);
};

export const registerDrone = async (uuid, secred, position) => {
  await db.DroneCollection.create({
      uuid: uuid,
      secred: secred,

      
  })
};

