// models/User.js
const { DataTypes } = require('sequelize');

const User = (sequelize) => sequelize.define('users', {
  // 여기 sequelize는 index.js에서 전달 받음
  // define() : 모델을 정의(또는 생성)하는 메서드
  // 'users' : 테이블 이름
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
    unique: true,
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
    validate: { // 이메일 형식 유효성 검사
      isEmail: true,
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