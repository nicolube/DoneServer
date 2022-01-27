var droneCollection = Waterline.Collection.extend({
    identity: 'point_connection',
    datastore: 'default',
    primaryKey: 'uuid',
  
    attributes: {
      uuid: {
        type: 'string',
      },
      target_point: { model: 'point'},
      point: { model: 'point'},
      position: { model: 'position' },
      connected: { type: "boolean", required: true, defaultsTo: false},
      status: { type: "number", required: true, defaultsTo: 0}
    }
  });