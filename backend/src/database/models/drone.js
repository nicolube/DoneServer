import Waterline from "waterline";

export var droneCollection = Waterline.Collection.extend({
    identity: 'drone',
    datastore: 'default',
    primaryKey: 'uuid',
  
    attributes: {
      uuid: {
        type: 'string',
      },
      target_point: { model: 'point'},
      point: { model: 'point'},
      position: { model: 'position' },
      connected: { type: "boolean",  defaultsTo: false},
      status: { type: "number", defaultsTo: 0}
    }
  });