import Waterline from "waterline";

export var secredCollection = Waterline.Collection.extend({
    identity: 'secred',
    datastore: 'default',
    primaryKey: 'id',
  
    attributes: {
      id: {
          type: 'number',
          autoMigrations: {autoIncrement: true}
      },
      secred: {type:'string', required: true},
      type: {type:'string', required: true},
      
    }
  });