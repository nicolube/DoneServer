var positionCollection = Waterline.Collection.extend({
    identity: 'position',
    datastore: 'default',
    primaryKey: 'id',
  
    attributes: {
      id: {
          type: 'number',
          autoMigrations: {autoIncrement: true}
      },
      x: {type:'number', required: true},
      y: {type:'number', required: true},
      z: {type:'number', required: true},
    }
  });