const express = require('express');
const { Question } = require('../models');// index는 파일 이름 생략 가능 
const { Op } = require("sequelize");
const session = require('express-session');
const crypto = require('crypto');

const router = express.Router();

// 질문 업로드 api
router.post('/', async (req, res) => {
  try {
    const question = await Question.create(req.body);

    if(question) {
      return res.status(200).json( { "message" : "질문 업로드 성공"} )
    } else {
      return res.status(400).json( { "message" : "질문 업로드 실패"} )
    }
    
  } catch (error) {
    console.error(error);
    return res.status(500).json( { "message" : "질문 업로드 실패"} )
  }
})

// 질문 정보 불러오는 api
router.get('/:question_id', async (req, res) => {
  try {
    const question_id = req.params.question_id
    const question = await Question.findOne({
      where : { id : question_id }
    });

    if(question) {
      return res.status(200).json( { "message" : "질문 불러오기 성공", question } )
    } else {
      return res.status(400).json( { "message" : "질문 불러오기 실패"} )
    }
    
  } catch (error) {
    console.error(error);
    return res.status(500).json( { "message" : "질문 불러오기 실패"} )
  }
})

// 질문 list 정보 불러오는 api
router.get('/', async (req, res) => {
  try {
    const questions = await Question.findAll();

    if(questions) {
      return res.status(200).json( { "message" : "질문 list 불러오기 성공", questions } )
    } else {
      return res.status(400).json( { "message" : "질문 list 불러오기 실패"} )
    }
    
  } catch (error) {
    console.error(error);
    return res.status(500).json( { "message" : "질문 list 불러오기 실패"} )
  }
})

// 질문 수정 api
router.patch('/:question_id', async (req, res) => {
  const { title, content, tag } = req.body
  const id = req.params.question_id

  try {
    const question = await Question.update({
      title : title,
      content : content,
      tag : tag
    }, {
      where : { id : id }
    })

    const editedQuestion = await Question.findOne({
      where : { id : id }
    })

    console.log("***", editedQuestion.dataValues)

    if(question) {
      return res.status(201).json({ "message" : "질문 수정 성공" })
    } else {
      return res.status(404).json({ "message" : "질문 수정 실패" })
    }
  } catch (error) {
    return res.status(500).json({ "message" : "질문 수정 실패" })
  }
})

// 질문 삭제 api
router.delete('/:question_id', async (req, res) => {
  const id = req.params.question_id
  try {
    Question.destroy({
      where : { id : id }
    })

    return res.status(201).json({ "message" : "질문 삭제 성공" })

  } catch (error) {
    return res.status(500).json({ "message" : "질문 삭제 실패" })
  }
})

//내가 쓴 질문 조회 api
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId; // 사용자의 로그인 ID를 가져옴

  try {
    // 사용자가 작성한 모든 질문을 조회
    const userQuestions = await Question.findAll({
      where: {
        userId: userId
      }
    });

    res.json(userQuestions);
  } catch (error) {
    console.error('Error fetching user questions:', error);
    res.status(500).json({ error: 'Error fetching user questions' }); // 오류 발생 시 500 에러 응답
  }
});


module.exports = router