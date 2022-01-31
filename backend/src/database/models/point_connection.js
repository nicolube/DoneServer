import Waterline from "waterline";

export var pointConnectionCollection = Waterline.Collection.extend({
  identity: 'point_connection',
  datastore: 'default',
  primaryKey: 'id',

  attributes: {
    id: {
      type: 'number',
      autoMigrations: { autoIncrement: true }
    },
    owner: { model: 'point', required: true },
    target: { model: 'point', required: true },
    distance: { type: "number", required: true }
  }
});