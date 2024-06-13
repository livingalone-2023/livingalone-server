const express = require('express');
const { User } = require('../models');// index는 파일 이름 생략 가능
const { Op } = require("sequelize");
const session = require('express-session');
const crypto = require('crypto');
const fs = require('fs');
const router = express.Router();
const bcrypt = require('bcrypt');

const multer=require('multer');
const path=require('path');

router.put('/:user_id/password', async (req, res) => {
  const userId = req.params.user_id;
  const { currentPassword, newPassword, newPasswordConfirmation } = req.body;

  try {
    // 사용자 찾기
    const user = await User.findByPk(userId);

    if (user) {
      // 현재 비밀번호가 맞는지 확인
      const hashedCurrentPassword = crypto.pbkdf2Sync(currentPassword, user.salt, 10000, 64, 'sha512').toString('base64');
      if (hashedCurrentPassword !== user.password) {
        return res.status(400).json({ message: '현재 비밀번호가 일치하지 않습니다. 다시 입력해주세요.' });
      }

      // 새로운 비밀번호와 확인 비밀번호가 일치하는지 확인
      if (newPassword !== newPasswordConfirmation) {
        return res.status(400).json({ message: '새로운 비밀번호와 확인 비밀번호가 일치하지 않습니다. 다시 입력해주세요.' });
      }

      // 비밀번호가 변경 전과 동일한지 확인
      const hashedNewPassword = crypto.pbkdf2Sync(newPassword, user.salt, 10000, 64, 'sha512').toString('base64');
      if (hashedNewPassword === user.password) {
        return res.status(400).json({ message: '새로운 비밀번호가 이전과 동일합니다. 새로운 비밀번호를 입력해주세요.' });
      }

      // 새로운 비밀번호 해싱
      const newHashedPassword = crypto.pbkdf2Sync(newPassword, user.salt, 10000, 64, 'sha512').toString('base64');

      // 사용자의 비밀번호 업데이트
      await User.update({ password: newHashedPassword }, { where: { user_pk: userId } });

      return res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } else {
      return res.status(404).json({ message: '해당 사용자를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ message: '서버 오류로 인해 비밀번호 변경에 실패했습니다.' });
  }
});

// 비밀번호 변경 API
router.put('/password', async (req, res) => {
  const { email, newPassword, newPasswordConfirmation } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (user) {
      if (newPassword !== newPasswordConfirmation) {
        return res.status(400).json({ message: '새로운 비밀번호와 확인 비밀번호가 일치하지 않습니다.' });
      }

      const newHashedPassword = crypto.pbkdf2Sync(newPassword, user.salt, 10000, 64, 'sha512').toString('base64');
      await User.update({ password: newHashedPassword }, { where: { email } });

      return res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } else {
      return res.status(404).json({ message: '해당 이메일을 가진 사용자를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ message: '서버 오류로 인해 비밀번호 변경에 실패했습니다.' });
  }
});




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
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('base64');

    const user = await User.create({
      user_id,
      name,
      password: hashedPassword,
      email,
      salt,
      image
    });

    return res.status(200).json({ message: '사용자 정보가 성공적으로 저장되었습니다.', user_id: user.user_id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '사용자 정보가 성공적으로 저장되지 않았습니다.' });
  }
});





// 로그인 API
router.post('/login', async (req, res) => {
  try {
    const { user_id, password } = req.body;
    const user = await User.findOne({ where: { user_id } });

    if (!user) {
      return res.status(400).json({ error: '존재하지 않는 사용자입니다.' });
    }

    const hashedPassword = crypto.pbkdf2Sync(password, user.salt, 10000, 64, 'sha512').toString('base64');
    if (hashedPassword !== user.password) {
      return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    return res.status(200).json({ message: '로그인 성공', user_pk: user.user_pk });
  } catch (err) {
    console.error("Error" + err);
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
// 유저의 아이디, 이름, 이메일, 프로필 이미지 URL을 불러옴
router.get('/:user_id', async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const user = await User.findOne({
      attributes: ["user_id", "name", "email", "image"], // 프로필 이미지 URL 포함
      where: { user_pk: user_id }
    });

    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ message: "유저 정보가 존재하지 않습니다." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "유저 정보 가져오기에 실패했습니다." });
  }
});



const uploadsDir = path.join(__dirname, '../uploads');

// 모든 라우트에 대해 'uploads' 폴더가 존재하는지 확인하는 미들웨어
const ensureUploadsFolder = (req, res, next) => {
  fs.access(uploadsDir, (err) => {
    if (err && err.code === 'ENOENT') {
      // 'uploads' 폴더가 없는 경우 생성
      fs.mkdir(uploadsDir, { recursive: true }, (err) => {
        if (err) {
          console.error('uploads 폴더 생성 실패:', err);
          next(err);
        } else {
          console.log('uploads 폴더 생성됨');
          next();
        }
      });
    } else if (err) {
      console.error('uploads 폴더 접근 오류:', err);
      next(err);
    } else {
      // 'uploads' 폴더가 이미 존재하는 경우
      next();
    }
  });
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); 
    const filename = file.fieldname + '-' + uniqueSuffix + ext; 
    req.imagePath = '/uploads/' + filename; 
    cb(null, filename); 
  }
});

const upload = multer({ storage: storage });

// 회원정보 수정 API
router.patch('/:user_pk', upload.single('image'), async (req, res) => {
  const user_pk = req.params.user_pk;
  const { name } = req.body;
  const imagePath = req.imagePath; // 이미지 상대 경로

  try {
    // Primary key로 사용자 조회
    const user = await User.findByPk(user_pk);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 사용자 정보 업데이트
    const updatedUser = await user.update({
      name,
      image: imagePath
    });

    return res.status(200).json({ message: '사용자 정보가 성공적으로 업데이트되었습니다.' });
  } catch (error) {
    console.error('사용자 정보 업데이트 중 오류 발생:', error);
    return res.status(500).json({ message: '사용자 정보 업데이트에 실패했습니다.' });
  }
});







// 유저 이메일 수정
router.patch('/email/:user_pk', async (req, res) => {
  const user_pk = req.params.user_pk
  const { new_email } = req.body;
  try {
    const user = await User.update({
      email : new_email
    }, {
      where : { user_pk }
    })

    return res.status(200).json({ "message" : "유저 이메일 수정에 성공했습니다.", "새로운 이메일" : new_email } )
  } catch (error) {
    return res.status(500).json({ "message" : "유저 이메일 수정에 실패했습니다." } )
  }
})





// 유저 정보 삭제
router.delete('/:user_id', async (req, res) => {
  const id = req.params.user_id
  try {
    await User.destroy({
      where : { user_pk: id }
    })

    return res.status(200).json({ "message" : "유저 정보 삭제에 성공했습니다." } )
  } catch (error) {

    return res.status(500).json({ "message" : "유저 정보 삭제에 실패했습니다." } )
  }
})


router.use(ensureUploadsFolder);
module.exports = router