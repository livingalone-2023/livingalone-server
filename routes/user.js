const express = require('express');
const { User } = require('../models');// index는 파일 이름 생략 가능
const { Op } = require("sequelize");
const session = require('express-session');
const crypto = require('crypto');

const router = express.Router();
const bcrypt = require('bcrypt');

// 비밀번호 변경 API
router.put('/password', async (req, res) => {
  const { email, newPassword, newPasswordConfirmation } = req.body;

  try {
    // 이메일로 사용자 찾기
    const user = await User.findOne({ where: { email } });

    // 사용자가 존재하는 경우
    if (user) {
      // 새로운 비밀번호와 확인 비밀번호가 일치하는지 확인
      if (newPassword !== newPasswordConfirmation) {
        return res.status(400).json({ message: '새로운 비밀번호와 확인 비밀번호가 일치하지 않습니다.' });
      }

      // 새로운 비밀번호 해싱
      const hashedPassword = await crypto.pbkdf2Sync(newPassword, user.salt, 10000, 64, 'sha512').toString('base64');

      // 사용자의 비밀번호 업데이트
      await User.update({ password: hashedPassword }, { where: { email } });

      return res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } else {
      // 사용자가 존재하지 않는 경우
      return res.status(404).json({ message: '해당 이메일을 가진 사용자를 찾을 수 없습니다.' });
    }
  } catch (error) {
      console.error('Error changing password:', error);
      return res.status(500).json({ message: '서버 오류로 인해 비밀번호 변경에 실패했습니다.' });
  }
});

// 새로운 비밀번호와 이전 비밀번호 비교 API
router.post('/password/compare', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // 이메일로 사용자 찾기
    const user = await User.findOne({ where: { email } });

    // 사용자가 존재하지 않는 경우
    if (!user) {
      return res.status(404).json({ message: '해당 이메일을 가진 사용자를 찾을 수 없습니다.' });
    }

    // 새로운 비밀번호와 이전 비밀번호가 같은지 확인
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: '새로운 비밀번호가 이전 비밀번호와 동일합니다.' });
    }

    return res.status(200).json({ message: '새로운 비밀번호가 이전 비밀번호와 다릅니다.' });
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return res.status(500).json({ message: '서버 오류로 인해 비밀번호 비교에 실패했습니다.' });
  }
});



router.post('/signup', async (req, res) => {
  try {
    const { user_id, name, password, email, image } = req.body;

    // 비밀번호 해싱에 사용할 salt 생성
    const salt = crypto.randomBytes(16).toString('hex');

    // 사용자 비밀번호와 salt를 합쳐 해싱
    const hashedPassword = await crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('base64');

    // 회원가입
    const user = await User.create({
      user_id,
      name,
      password: hashedPassword,
      email,
      salt,
      image // 이미지 URL 추가
    })

    return res.status(200).json({ message: '사용자 정보가 성공적으로 저장되었습니다.' , user_id: user.user_id });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '사용자 정보가 성공적으로 저장되지 않았습니다.' });
  }
});





// 로그인 API
router.post('/login', async (req, res) => {
  try {
    const { user_id, password } = req.body;

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

    return res.status(200).json({ message: '로그인 성공', user_pk: user.user_pk });
  } catch (err) {
    console.error("Error"+err);
    return res.status(500).json({ error: '서버 오류' });
  }
});



//내 계정 아이디 찾기 api
router.post('/find-id', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findOne({
      where: {
        name: name,
        email: email
      }
    });
    if (user) {
      return res.status(200).json(user.user_id);
    } else {
      return res.status(404).json("일치하는 정보가 없습니다.")
    }
  } catch (error) {
    return res.status(500).json("서버 오류가 발생하였습니다.")
  }

})




// 유저 한 명의 정보 불러오는 API (마이페이지)
// 유저의 아이디, 이름, 이메일만 불러옴
router.get('/:user_id', async (req, res) => {
  const user_id = req.params.user_id
  try {
    const user = await User.findAll({
      attributes : ["user_id", "name", "email"],
      where : { id : user_id }
    })

    if(user) {
      return res.status(200).json(user[0])
    } else {
      return res.status(404).json({ message : "유저 정보가 존재하지 않습니다." })
    }
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message : "유저 정보 가져오기에 실패했습니다." })
  }
})





// 유저 정보 수정
router.patch('/:user_id', async (req, res) => {
  const id = req.params.user_id
  const { image, name } = req.body;
  try {
    const user = await User.update({
      image, // 이미지 정보를 업데이트할 수 있도록 수정
      name
    }, {
      where : { id }
    })

    return res.status(200).json({ "message" : "유저 정보 수정에 성공했습니다." } )
  } catch (error) {
    return res.status(500).json({ "message" : "유저 정보 수정에 실패했습니다." } )
  }
})





// 유저 정보 삭제
router.delete('/:user_id', async (req, res) => {
  const id = req.params.user_id
  try {
    await User.destroy({
      where : { id }
    })

    return res.status(200).json({ "message" : "유저 정보 삭제에 성공했습니다." } )
  } catch (error) {

    return res.status(500).json({ "message" : "유저 정보 삭제에 실패했습니다." } )
  }
})

module.exports = router
