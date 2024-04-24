const express = require('express');
//const { Answer } = require('../models');// index는 파일 이름 생략 가능 
const { Op } = require("sequelize");
const session = require('express-session');
const crypto = require('crypto');
//const User = require('../models/User');
const { User, Answer } = require('../models')
const router = express.Router();
const fs = require('fs');
// 답변 작성 api
router.post('/', async (req, res) => {
    try {
        const answer = await Answer.create(req.body); // 요청의 내용으로 새로운 답변 생성
        if (answer) {
            return res.status(200).json({ "message": "답변이 성공적으로 등록되었습니다." });
        } else {
            return res.status(400).json({ "message": "답변 등록에 실패했습니다." });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "message": "서버 오류로 답변 등록에 실패했습니다." });
    }
});


//답변 수정 api 
router.patch('/:answer_id',async(req,res)=>{
const {isAccepted,isLiked}=req.body
const id=req.params.answer_id
try{
    const answer=await Answer.update({
        isAccepted:isAccepted,
        isLiked:isLiked
    },{
        where:{id:id}
    })
    const editedAnswer=await Answer.findOne({
        where :{id:id}
    })
    console.log("***",editedAnswer.dataValues)
    if(answer){
        return res.status(201).json({"message":"답변 수정이 정상적으로 되었습니다."})
    }else{
        return res.status(404).json({"message":"답변 수정이 정상적으로 실패하였습니다."})
    }
}catch(error){
    console.log(error);
    return res.status(500).json({"message":"서버 오류가 발생하였습니다."})
    //console.log(error);
}
})

// 사용자가 작성한 모든 답변 리스트를 반환하는 엔드포인트
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId; // 사용자의 로그인 ID를 가져옴
  
    try {
        // 사용자가 작성한 모든 답변을 조회
        const userAnswers = await Answer.findAll({
            where: {
                userId: userId // userId가 매개변수로 받은 사용자의 ID와 일치하는 답변을 찾음
            }
        });

        if (userAnswers) {
            // 사용자가 작성한 모든 답변을 JSON 형식으로 응답
            return res.status(200).json(userAnswers);
        } else {
            return res.status(404).json({ "message": "사용자의 답변을 찾을 수 없습니다." });
        }
    } catch (error) {
        console.error('Error fetching user answers:', error);
        res.status(500).json({ "message": "서버 오류가 발생하였습니다." }); // 오류 발생 시 500 에러 응답
    }
});


// 답변 삭제 api
router.delete('/:answer_id', async (req, res) => {
    const id = req.params.answer_id
    try {
        Answer.destroy({
            where: { id: id }
        })

        return res.status(201).json({ "message": "답변 삭제 성공" })

    } catch (error) {
        return res.status(500).json({ "message": "답변 삭제 실패" })
    }
})



// 모든 사용자가 작성한 답변 조회 API (사용자 이름과 함께)
router.get('/', async (req, res) => {
    try {
        // 모든 사용자가 작성한 답변을 조회하고 사용자의 이름과 함께 반환
        const allAnswers = await Answer.findAll({
            include: {
                model: User, // User 모델
                attributes: ['name'], // 사용자의 이름만 포함
                required: true // 내부 조인으로 설정하여 연결된 사용자가 있는 답변만 검색
            }
        });

        // 조회된 모든 답변을 반환합니다.
        return res.status(200).json({ message: "모든 사용자가 작성한 답변을 성공적으로 불러왔습니다.", data: allAnswers });
    } catch (error) {
        console.error('모든 답변을 불러오는 중에 오류 발생:', error);
        return res.status(500).json({ error: '모든 사용자가 작성한 답변을 불러오는 중에 오류가 발생했습니다.' });
    }
});



// 내가 쓴 질문 조회 API
router.get('/list/:user_id', async (req, res) => {
    const user_id = req.params.user_id; // 사용자의 ID를 가져옴

    try {
        // 사용자가 작성한 모든 질문을 조회
        const userQuestions = await Answer.findAll({
            where: { user_id: user_id }
        });

        // 사용자가 작성한 모든 질문과 그에 대한 정보를 반환
        return res.status(200).json({ message: "사용자의 질문을 모두 불러왔습니다.", data: userQuestions });
    } catch (error) {
        console.error('Error fetching user questions:', error);
        return res.status(500).json({ error: '사용자의 질문을 불러오는 중에 오류가 발생했습니다.' });
    }
});

// 답변 채택 API
router.patch('/:answer_id/accept', async (req, res) => {
    const answerId = req.params.answer_id; // answer_id 대신 answerId로 변수명 수정

    try {
        // 해당 answerId를 가진 답변을 채택 처리
        const updatedAnswer = await Answer.update(
            { isAccepted: true },
            { where: { id: answerId } }
        );

        // 업데이트된 답변이 존재하는 경우
        if (updatedAnswer > 0) {
            return res.status(200).json({ message: "답변이 채택되었습니다." });
        } else {
            return res.status(404).json({ message: "해당 답변을 찾을 수 없습니다." });
        }
    } catch (error) {
        console.error('Error accepting answer:', error);
        return res.status(500).json({ message: "서버 오류로 인해 답변 채택에 실패했습니다." });
    }
});


// 답변 좋아요 API
router.patch('/:answer_id/like', async (req, res) => {
    const answerId = req.params.answer_id;
    try {
        const updatedAnswer = await Answer.findByPk(answerId);
        if (updatedAnswer) {
            // 답변이 존재하는 경우
            await Answer.update({ isLiked: 1 }, { where: { id: answerId } });
            return res.status(200).json({ "message": "좋아요를 성공적으로 눌렀습니다" });
        } else {
            // 답변이 존재하지 않는 경우
            return res.status(404).json({ "message": "해당 답변을 찾을 수 없습니다." });
        }
    } catch (error) {
        // 서버 오류 발생 시
        console.log(error);
        return res.status(500).json({ "message": "서버 오류가 발생하였습니다." });
    }
});

router.get('/:userId/profile-image-url', async (req, res) => {
    const userId = req.params.userId; // 요청에서 사용자 ID 가져오기

    try {
        // 사용자의 정보 조회
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: '해당 사용자를 찾을 수 없습니다.' });
        }

        // 사용자의 프로필 이미지 URL 가져오기
        const profileImageUrl = user.image; // 프로필 이미지 URL은 User 모델에서 "image" 속성으로 저장됨

        // 프로필 이미지 URL 반환
        return res.status(200).json({ profileImageUrl });
    } catch (error) {
        console.error('프로필 이미지 URL 조회 오류:', error);
        return res.status(500).json({ error: '프로필 이미지 URL을 가져오는 중에 오류가 발생했습니다.' });
    }
});

"SELECT name FROM answers INNER JOIN users ON answers.user_id = Users.id"

Answer.findAll({
    include: {
        model: User,
        attributes: ['name'],
        required: true
    }
})


  // 사용자와의 관계 설정
Answer.belongsTo(User, { foreignKey: 'user_pk' }); // Answer 모델이 User 모델에 속한다는 관계 설정


module.exports = router