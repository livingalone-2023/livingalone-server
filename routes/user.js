const express = require('express');
const { User } = require('../models');// index는 파일 이름 생략 가능 
const { Op } = require("sequelize");
const session = require('express-session');
const crypto = require('crypto');

const router = express.Router();

  // 사용자 정보 저장 API
router.post('/', async (req, res) => {
  try {
    const { user_id, name, password = crypto.createHash('sha512').update(password).digest('base64'), email } = req.body;

    const user = await User.create({
      user_id,
      name,
      password,
      email
    })

    console.log(user);

    return res.status(200).json({ message: '사용자 정보가 성공적으로 저장되었습니다.' });

  } catch (err) {
    
    return res.status(500).json({ error: err.message });
  }

});

module.exports = router