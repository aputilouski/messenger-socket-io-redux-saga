const { Sequelize, DataTypes, Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const User = db => {
  const Model = db.define('user', {
    uuid: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
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
    connected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    disconnected_at: {
      type: DataTypes.DATE,
    },
  });

  Model.companionAttributes = ['uuid', 'username', 'name', 'connected', 'disconnected_at'];
  Model.userAttributes = ['uuid', 'username', 'name'];

  Model.prototype.getPublicFields = function () {
    const user = {};
    Model.companionAttributes.forEach(key => {
      user[key] = this[key];
    });
    return user;
  };

  Model.prototype.confirmPassword = function (string) {
    return bcrypt.compare(string, this.password);
  };

  Model.encryptPassword = async str => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(str, salt);
  };

  Model.associate = ({ User, Room, Message }) => {
    Model.loadAssociatedRooms = uuid =>
      User.findByPk(uuid, {
        attributes: [],
        include: {
          model: Room,
          as: 'rooms',
          include: [
            {
              model: User,
              as: 'users',
              attributes: User.companionAttributes,
              where: { uuid: { [Op.not]: uuid } },
              required: false,
            },
            {
              model: Message,
              as: 'messages',
              separate: true,
              limit: 1,
              order: [['created_at', 'DESC']],
            },
          ],
        },
      });

    Model.loadUnreadMessagesCounter = uuid =>
      User.findByPk(uuid, {
        attributes: [],
        include: {
          model: Room,
          as: 'rooms',
          include: [
            {
              model: Message,
              as: 'messages',
              attributes: [],
              where: {
                from: { [Op.not]: uuid },
                created_at: { [Op.gt]: Sequelize.col('rooms->user_room.last_read') },
              },
            },
          ],
          attributes: ['id', [Sequelize.fn('COUNT', Sequelize.col('rooms->messages.id')), 'unread_count']],
        },
        group: ['user.uuid', 'rooms.id', 'rooms->user_room.last_read', 'rooms->user_room.room_id', 'rooms->user_room.user_uuid'],
      });
  };

  return Model;
};

module.exports = User;
