const express = require('express');
const session = require('express-session');
const cors = require('cors');
const multer = require('multer');
const sequelize = require("./config/config");

const path = require('path');
const bodyParse = require('body-parser')

const app = express();
const port = 3000;

// routes
const userRouter = require('./routes/user')

// app.get('/', (req, res) => {
//   return res.send("홀로서기");
// })

sequelize.sync()
  .then(() => {
    console.log('Database synced')
  })
  .catch((err) => {
    console.error('Error syncing database:', err)
  });

// 미들웨어
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require('cookie-parser')());
app.use(bodyParse.json())

// router - 진입할 엔드포인트 + 진입할 라우터
app.use('/users', userRouter)

app.listen(port, () => {
  console.log(port, '번 포트에서 대기 중');
});