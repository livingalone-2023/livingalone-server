const { DataTypes } = require('sequelize');
// const sequelize = require('./index'); // Sequelize 인스턴스
// const User = require('./User');

const Answer =(sequelize) =>sequelize.define('answers', {
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
    user_pk: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'users', // 외래 키로 사용할 모델
            key: 'user_pk' // 외래 키로 사용할 모델의 PK
        }
    },
    question_pk : {
        type : DataTypes.BIGINT,
        allowNull : false,
        references: {
            model: 'questions',
            key: 'question_pk'
        }
    }
});

// 사용자와의 관계 설정
//Answer.belongsTo(User, { foreignKey: 'user_pk' }); // Answer 모델이 User 모델에 속한다는 관계 설정

module.exports = Answer;
