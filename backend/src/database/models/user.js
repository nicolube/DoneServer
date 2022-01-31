import Waterline from "waterline";

export var userCollection = Waterline.Collection.extend({
    identity: 'user',
    datastore: 'default',
    primaryKey: 'id',
  
    attributes: {
      id: {
          type: 'number',
          autoMigrations: {autoIncrement: true}
      },
      uuid: {type:'string', required: true},
      username: {type:'string', required: true},
      password: {type:'string', required: true}

    }
  });