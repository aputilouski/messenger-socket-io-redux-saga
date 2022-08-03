const Room = db => {
  const Model = db.define('room', {}, { updatedAt: false });

  Model.associate = models => {
    Model.hasMany(models.Message, {
      as: 'messages',
      foreignKey: { name: 'room_id', allowNull: false, unique: false },
    });
  };

  return Model;
};

module.exports = Room;
