const { DataTypes } = require('sequelize');

const UserRoom = db => {
  const Model = db.define(
    'user_room',
    {
      last_view: { type: DataTypes.DATE },
    },
    { timestamps: false }
  );

  Model.associate = models => {
    models.Room.belongsToMany(models.User, { through: Model, as: 'users' });
    models.User.belongsToMany(models.Room, { through: Model, as: 'rooms' });
  };

  return Model;
};

module.exports = UserRoom;
