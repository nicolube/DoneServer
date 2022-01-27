var pointCollection = Waterline.Collection.extend({
    identity: 'point',
    datastore: 'default',
    primaryKey: 'id',
  
    attributes: {
      id: {
          type: 'number',
          autoMigrations: {autoIncrement: true}
      },
      name: {type:'number', required: true},
      type: {type:'number'},
      x: {type:'number', required: true},
      y: {type:'number', required: true},
      z: {type:'number', required: true},
      connected: {
          collection: 'point_connection',
          via: 'owner'
      }
    }
  });