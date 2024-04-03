const { DataTypes } = require('sequelize');

const Answer = (sequelize) => sequelize.define('answers', {
  // 여기 sequelize는 index.js에서 전달 받음
  // define() : 모델을 정의(또는 생성)하는 메서드
  // 'answers' : 테이블 이름
  answer_pk: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  answer: {
    type: DataTypes.TEXT,
    
  },
  isAccepted: {
    type: DataTypes.TINYINT,
    allowNull: false,
  },
  isLiked: {
    type: DataTypes.TINYINT,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_pk'
    }
  }
});

module.exports = Answer;