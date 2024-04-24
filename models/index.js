// module export
// const로 상수 선언 
const sequelize = require('../config/config')

const User = require('./user')(sequelize); // sequelize가 db 정보를 가지고 있으므로 전달해주면 얘가 만들어봄
const Question = require('./question')(sequelize);
const Answer = require('./answer')(sequelize);
const Like = require('./like')(sequelize);

User.hasMany(Question, { foreignKey: 'user_pk' });
User.hasMany(Like, { foreignKey: 'user_pk'});
// User.hasMany(Answer, { foreignKey: 'user_pk'});

Question.belongsTo(User, {foreignKey : 'user_pk'});
Question.hasMany(Answer, {foreignKey : 'question_pk'});

Answer.belongsTo(User, {foreignKey : 'user_pk'});
// Answer.belongsTo(Question, {foreignKey : 'question_pk'});
Answer.hasMany(Like, {foreignKey : 'answer_pk'});


Like.belongsTo(User, {foreignKey: 'user_pk'});
Like.belongsTo(Answer, {foreignKey : 'answer_pk'});

module.exports = {
  User,
  Question,
  Answer,
  Like
}