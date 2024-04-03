const { DataTypes } = require('sequelize');

const Like = (sequelize) => sequelize.define('likes', {
  // 여기 sequelize는 index.js에서 전달 받음
  // define() : 모델을 정의(또는 생성)하는 메서드
  // 'questions' : 테이블 이름
  user_pk: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_pk'
    }
  },
  answer_pk: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'answers',
      key: 'answer_pk'
    }
  }
});

module.exports = Like;
