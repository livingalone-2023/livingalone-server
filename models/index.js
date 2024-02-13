// module export
// const로 상수 선언 
const sequelize = require('../config/config')

const User = require('./users')(sequelize); // sequelize가 db 정보를 가지고 있으므로 전달해주면 얘가 만들어봄
const Answer = require('./answers')(sequelize);
const Question = require('./questions')(sequelize);

module.exports = {
  User,
  Answer,
  Question
}