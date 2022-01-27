import Waterline from 'waterline';
import sailsDiskAdapter from "sails-disk"

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

waterline.initialize(config, (err, ontology) => {
    if (err) {
        console.error(err);
        return;
    }
});