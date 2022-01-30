import Waterline from 'waterline';
import sailsDiskAdapter from "sails-disk"
    ;
import { pointCollection } from './models/point';
import { droneCollection } from './models/drone';
import { pointConnectionCollection } from './models/point_connection';
import { positionCollection } from './models/position';


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

waterline.registerModel(pointCollection)
waterline.registerModel(pointConnectionCollection)
waterline.registerModel(positionCollection)
waterline.registerModel(droneCollection)

waterline.initialize(config, (err, ontology) => {
    if (err) {
        console.error(err);
        return;
    }
});