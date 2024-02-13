const { DataTypes } = require('sequelize');

const Question = (sequelize) => sequelize.define('questions', {
  // 여기 sequelize는 index.js에서 전달 받음
  // define() : 모델을 정의(또는 생성)하는 메서드
  // 'answers' : 테이블 이름
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
    unique: true,
  },
  title: {
    type: DataTypes.STRING(100),
    
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  views: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  tag: {
    type: DataTypes.STRING(20),
    allowNull: false,
  }
});

module.exports = Question;