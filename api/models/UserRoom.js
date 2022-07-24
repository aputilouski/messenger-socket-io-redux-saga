const { DataTypes } = require('sequelize');

const UserRoom = db => {
  const Model = db.define(
    'user_room',
    {
      last_read: { type: DataTypes.DATE },
    },
    { timestamps: false }
  );

  Model.associate = models => {
    models.Room.belongsToMany(models.User, {
      through: Model,
      as: 'users',
      onDelete: 'cascade',
      foreignKey: { name: 'room_id', allowNull: false, unique: false },
    });
    models.User.belongsToMany(models.Room, {
      through: Model,
      as: 'rooms',
      onDelete: 'cascade',
      foreignKey: { name: 'user_uuid', allowNull: false, unique: false },
    });
  };

  return Model;
};

module.exports = UserRoom;
