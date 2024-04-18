const { DataTypes } = require('sequelize');

const User = (sequelize) => sequelize.define('users', {
    // user_pk: 사용자의 주요 키입니다.
    user_pk: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true, // 이메일 형식 유효성 검사
      },
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
    }
  });

module.exports = User;