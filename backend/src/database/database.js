import Waterline from 'waterline';
import sailsDiskAdapter from "sails-disk";
import pointCollection from './models/point.js';
import { droneCollection } from './models/drone.js';
import { pointConnectionCollection } from './models/point_connection.js';
import { positionCollection } from './models/position.js';
import { secredCollection } from './models/secred.js';
import { userCollection } from './models/user.js';
import * as argon2 from 'argon2';


var waterline = new Waterline();

var config = {
    adapters: {
        'disk': sailsDiskAdapter
    },

    datastores: {
        default: {
            adapter: 'disk'
        }
    }
};

waterline.registerModel(secredCollection);
waterline.registerModel(userCollection);

waterline.registerModel(pointCollection);
waterline.registerModel(pointConnectionCollection);
waterline.registerModel(positionCollection);
waterline.registerModel(droneCollection);


export var SecredCollection = null;
export var UserCollection = null;

export var PointCollection = null;
export var PointConnectionCollection = null;
export var PositionCollection = null;
export var DroneCollection = null;

waterline.initialize(config, async (err, ontology) => {
    if (err) {
        console.error(`Failed to connect to datebase: ${err}`);
        return
    }
    console.error(`Database connected.`);

    SecredCollection = ontology.collections.secred;
    UserCollection = ontology.collections.user;

    PointCollection = ontology.collections.point;
    PointConnectionCollection = ontology.collections.point_connection
    PositionCollection = ontology.collections.position;
    DroneCollection = ontology.collections.drone;

    if (await UserCollection.count() === 0) {
        await UserCollection.create({
            username: "admin",
            password: await argon2.hash("password123")
        })
    }
});

