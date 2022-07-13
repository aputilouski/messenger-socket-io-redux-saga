const { DataTypes } = require('sequelize');

// const bcrypt = require('bcryptjs');

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

  // Model.prototype.getPublicFields = function () {
  //   const user = this.get();
  //   const HiddenFields = ['pass', 'createdAt', 'updatedAt'];
  //   HiddenFields.forEach(field => {
  //     delete user[field];
  //   });
  //   return user;
  // };

  // Model.publicAttributes = ['user_id', 'first_name', 'last_name', 'email', 'profile_pic', 'role'];

  // Model.encryptPassword = function (passwordString) {
  //   const salt = bcrypt.genSaltSync(8);
  //   return bcrypt.hash(passwordString, salt);
  // };

  return Model;
};

module.exports = User;
