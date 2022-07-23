const { DataTypes } = require('sequelize');

const Message = db => {
  const Model = db.define('message', {
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true },
    },
  });

  Model.associate = models => {
    Model.belongsTo(models.User, {
      as: 'creator',
      foreignKey: { name: 'from', allowNull: false, unique: false },
    });
  };

  return Model;
};

module.exports = Message;
