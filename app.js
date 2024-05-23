const express = require('express');
const session = require('express-session');
const cors = require('cors');
const multer = require('multer');
// const sequelize = require("./config/config");
const sequelize = require("./models");

const path = require('path');
const bodyParse = require('body-parser')

const app = express();
const port = 3000;

// routes
const userRouter = require('./routes/user')
const answerRouter = require('./routes/answer')
const questionRouter = require('./routes/question')

// app.get('/', (req, res) => {
//   return res.send("홀로서기");
// })

sequelize.sync({ alter: true }) // 이 옵션은 테이블 구조를 현재 모델 정의와 맞도록 변경합니다.
  .then(() => {
    console.log('Database & tables created/updated!');
    
    // 서버 시작
    app.listen(port, () => {
      console.log(port, '번 포트에서 대기 중');
    });
  })
  .catch((error) => {
    console.error('Unable to sync database:', error);
  });

// 미들웨어
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require('cookie-parser')());
app.use(bodyParse.json())
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// router - 진입할 엔드포인트 + 진입할 라우터
app.use('/users', userRouter)
app.use('/questions', questionRouter)
app.use('/answers', answerRouter)

app.listen(port, () => {
  console.log(port, '번 포트에서 대기 중');
});