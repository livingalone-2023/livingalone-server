const express = require('express');
const { User } = require('../models');// index는 파일 이름 생략 가능 
const { Op } = require("sequelize");
const session = require('express-session');
const crypto = require('crypto');

const router = express.Router();

// 회원가입 API
router.post('/signup', async (req, res) => {
  try {
    const { user_id, name, password, email } = req.body;

    // 비밀번호 해싱에 사용할 salt 생성
    const salt = crypto.randomBytes(16).toString('hex');

    // 사용자 비밀번호와 salt를 합쳐 해싱
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('base64');

    // 중복 체크
    const userCheck = await User.findOne({
      where: {
        [Op.or]: [{ user_id }, { email }],
      },
    });

    if (userCheck) {
      return res.status(400).json({ error: '이미 가입된 사용자입니다.' });
    }

    // 회원가입
    const user = await User.create({
      user_id,
      name,
      password: hashedPassword,
      email,
      salt
    })

    return res.status(200).json({ message: '사용자 정보가 성공적으로 저장되었습니다.' });

  } catch (err) {

    console.error("Error"+err);
    return res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router