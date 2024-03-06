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
    return res.status(500).json({ error: '사용자 정보가 성공적으로 저장되지 않았습니다.' });
  }
});

// 로그인 API
router.post('/login', async (req, res) => {
  try {
    const { user_id, password } = req.body

    // 사용자 확인
    const user = await User.findOne({
      where: {
        user_id,
      },
    });

    // 사용자가 존재하지 않으면 오류 응답
    if (!user) {
      return res.status(400).json({ error: '존재하지 않는 사용자입니다.' });
    }

    // 입력된 비밀번호와 저장된 salt를 사용하여 해싱
    const hashedPassword = crypto.pbkdf2Sync(password, user.salt, 10000, 64, 'sha512').toString('base64');

    // 해싱된 비밀번호 비교
    if (hashedPassword !== user.password) {
      return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    // 로그인 성공 시 세션 생성 또는 토큰 발급 등의 작업 수행
    req.session.user = {
      user_id: user.dataValues.user_id,
      name: user.dataValues.name,
      email: user.dataValues.email,
    };

    return res.status(200).json({ message: '로그인 성공', user: req.session.user });
    // return res.status(200).json({ message: '로그인 성공' });

  } catch (err) {
    console.error("Error"+err);
    return res.status(500).json({ error: '서버 오류' });
  }
})

//내 계정 아이디 찾기 api
router.post('/find-id',async(req,res)=>{
  try{
    const {name,email}=req.body;
    const user=await User.findOne({
      where: {
        name: name,
        email: email
    }
    });
    if(User){
    return res.status(200).json({ message: `회원님의 아이디는 ${user.user_id}입니다.`  });
    }else{
      return res.status(404).json("일치하는 정보가 없습니다.")
    }
    }catch(error){
      return res.status(500).json("서버 오류가 발생하였습니다.")
    }
  
})
module.exports = router