const express = require('express');
const { Answer } = require('../models');// index는 파일 이름 생략 가능 
const { Op } = require("sequelize");
const session = require('express-session');
const crypto = require('crypto');

const router = express.Router();

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
        where : { id : id }
      })
  
      return res.status(201).json({ "message" : "답변 삭제 성공" })
  
    } catch (error) {
      return res.status(500).json({ "message" : "답변 삭제 실패" })
    }
  })

//답변 조회 api
router.get('/',async(req,res)=>{
    try{
        const answers=await Answer.findAll();
        if(answers){
            return res.status(200).json({"message":"답변들을 정상적으로 모두 가져왔습니다"})
        }else{
            return res.status(400).json({"message":"답변들을 정상적으로 불러오는데에 실패했습니다."})
        }
    }catch(error){
        console.log(error);
        return res.status(500).json({"message:":"서버 오류가 발생하였습니다.."})
    }
})

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

//답변채택 api
router.patch('/:answer_id/accept', async (req, res) => {
    const id = req.params.answer_id;
    try {
        const updatedAnswer = await Answer.update(
            { isAccepted: true },
            { where: { id: id } }
        );
        if (id) {
            //채택이 존재하는 경우
            await Answer.update({isAccepted:1},{where:{id:answerId}})
            return res.status(200).json({ "message": "답변이 채택되었습니다." });
        } else {
            return res.status(404).json({ "message": "해당 답변을 찾을 수 없습니다." });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "message": "서버 오류로 인해 답변 채택에 실패했습니다." });
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


// 사용자가 작성한 모든 답변 리스트를 반환하는 엔드포인트
router.get('all/:userId', async (req, res) => {
    const userId = req.params.userId; // 사용자의 로그인 ID를 가져옴
  
    try {
      // 사용자가 작성한 모든 질문을 조회
      const userQuestions = await Question.findAll({
        where: {
          userId: userId // userId가 매개변수로 받은 사용자의 ID와 일치하는 질문을 찾음
        }
      });
  
      // 사용자가 작성한 모든 질문에 대한 답변 리스트를 조회
      const userAnswers = await Promise.all(userQuestions.map(async (question) => {
        return await Answer.findAll({
          where: {
            questionId: question.id // 질문의 ID와 일치하는 답변을 찾음
          }
        });
      }));
  
      // 사용자가 작성한 모든 답변 리스트를 결합하여 반환
      const allUserAnswers = userAnswers.flat();
      res.json(allUserAnswers); // 조회된 답변 리스트를 JSON 형식으로 응답
    } catch (error) {
      console.error('Error fetching user answers:', error);
      res.status(500).json({ error: 'Error fetching user answers' }); // 오류 발생 시 500 에러 응답
    }
  });
  

module.exports = router