const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const User = db => {
  const Model = db.define(
    'user',
    {
      username: {
        type: DataTypes.STRING(30),
        unique: true,
        allowNull: false,
        validate: { len: [3, 30] },
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: { len: [3, 50] },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
    },
    { underscored: true }
  );

  Model.publicAttributes = ['username', 'name'];

  Model.prototype.getPublicFields = function () {
    const user = this.get();
    Object.keys(user).forEach(attribute => {
      if (!Model.publicAttributes.includes(attribute)) delete user[attribute];
    });
    return user;
  };

  Model.encryptPassword = async str => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(str, salt);
  };

  Model.comparePassword = bcrypt.compare;

  return Model;
};

module.exports = User;
