const express = require('express');
//const { Answer } = require('../models');// index는 파일 이름 생략 가능 
const { Op } = require("sequelize");
const session = require('express-session');
const crypto = require('crypto');
//const User = require('../models/User');
const { User, Answer, Question } = require('../models'); 
const router = express.Router();
const fs = require('fs');

// 답변 작성 API
router.post('/', async (req, res) => {
    try {
        const { answer, isAccepted, user_pk, question_pk } = req.body;

        // 질문이 존재하는지 확인
        const question = await Question.findByPk(question_pk);
        if (!question) {
            return res.status(404).json({ message: '해당 질문을 찾을 수 없습니다.' });
        }

        // 답변 생성
        const newAnswer = await Answer.create({
            answer,
            isAccepted,
            user_pk,
            question_pk,
        });

        return res.status(200).json({ message: '답변이 성공적으로 등록되었습니다.'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: '서버 오류로 답변 등록에 실패했습니다.' });
    }
});

// 답변 수정 API
router.patch('/:answer_id', async (req, res) => {
    const { answer } = req.body;
    const id = req.params.answer_id;
    try {
        const idExistAnswer = await Answer.findOne({
            where: { answer_pk: id }
        });

        // 존재하는 answer인지
        if(idExistAnswer) {
            const updatedAnswer = await Answer.update({
                answer: answer
            }, {
                where: { answer_pk: id }
            });
            const editedAnswer = await Answer.findOne({
                where: { answer_pk: id }
            });
            console.log("***", editedAnswer);
            if (updatedAnswer) {
                return res.status(201).json({ "message": "답변 수정이 정상적으로 되었습니다." });
            } else {
                return res.status(404).json({ "message": "답변 수정이 정상적으로 실패하였습니다." });
            }
        } else {
            return res.status(404).json({ "message": "없는 답변입니다." });
        }

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "message": "서버 오류가 발생하였습니다." });
    }
});


// 답변 삭제 api
router.delete('/:answer_pk', async (req, res) => {
    const answer_pk = req.params.answer_pk; 

    try {
        // 해당 answer_pk를 가진 답변 삭제
        const deletedRowCount = await Answer.destroy({
            where: { answer_pk: answer_pk }
        });

        // 삭제된 레코드가 있으면 성공 메시지 반환
        if (deletedRowCount > 0) {
            return res.status(200).json({ message: "답변 삭제 성공" });
        } else {
            // 삭제된 레코드가 없으면 해당 답변을 찾을 수 없다는 메시지 반환
            return res.status(404).json({ message: "삭제할 답변을 찾을 수 없습니다." });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "답변 삭제 실패" });
    }
});




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

// 내가 쓴 답변 조회 API (페이지네이션 적용)
router.get('/list/:user_pk', async (req, res) => {
    const user_pk = req.params.user_pk; 
    const page = parseInt(req.query.page) 
    const limit = 5;
    const offset = (page - 1) * limit; 

    try {
        // 사용자가 작성한 모든 답변 조회 (페이지네이션 적용)
        const { count, rows } = await Answer.findAndCountAll({
            where: { user_pk: user_pk },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        await Promise.all(rows.map(async (answer) => {
            const question = await Question.findByPk(answer.question_pk);
            const {count} = await Answer.findAndCountAll({
                where: { question_pk: answer.question_pk }
            });
            answer.dataValues.questionTitle = question ? question.title : null;
            answer.dataValues.questionViews = question ? question.views : null;
            answer.dataValues.thisQuestionAnswerCount = count;
            console.log(answer)
        }));

        const totalPages = Math.ceil(count / limit); // 총 페이지 수 계산

        // 페이지 수가 총 페이지 수를 초과하는 경우 빈 배열 반환
        if (page > totalPages) {
            return res.status(200).json({
                message: "더 이상 댓글이 없습니다.",
                data: [],
                currentPage: page,
                totalPages: totalPages,
                totalAnswerCount : count,
                limit
            });
        }

        return res.status(200).json({
            data: rows,
            currentPage: page,
            totalPages: totalPages,
            totalAnswerCount : count,
            limit
        });

    } catch (error) {
        console.error('Error fetching user answers:', error);
        return res.status(500).json({ error: '사용자의 댓글을 불러오는 중에 오류가 발생했습니다.' });
    }
});


// 답변 채택 API
router.patch('/:answer_id/accept', async (req, res) => {
    const answerId = req.params.answer_id; // answer_id 대신 answerId로 변수명 수정

    try {
        // 해당 answerId를 가진 답변을 채택 처리
        await Answer.update(
            { isAccepted: true },
            { where: { answer_pk: answerId } }
        );

        const updatedAnswer = await Answer.findOne(
            {where : { answer_pk: answerId }}
        )
        console.log(updatedAnswer)

        // 업데이트된 답변이 존재하는 경우
        return res.status(200).json({ message: "답변이 채택되었습니다.", updatedAnswer });
    } catch (error) {
        console.error('Error accepting answer:', error);
        return res.status(500).json({ message: "서버 오류로 인해 답변 채택에 실패했습니다." });
    }
});

// 답변 채택 (취소) 수정 API
router.patch('/:answer_id/not-accept', async (req, res) => {
    const answerId = req.params.answer_id; // answer_id 대신 answerId로 변수명 수정

    try {
        // 해당 answerId를 가진 답변을 채택 처리
        await Answer.update(
            { isAccepted: false },
            { where: { answer_pk: answerId } }
        );

        const updatedAnswer = await Answer.findOne(
            {where : { answer_pk: answerId }}
        )
        console.log(updatedAnswer)

        // 업데이트된 답변이 존재하는 경우
        return res.status(200).json({ message: "답변이 채택되었습니다.", updatedAnswer });
    } catch (error) {
        console.error('Error accepting answer:', error);
        return res.status(500).json({ message: "서버 오류로 인해 답변 채택에 실패했습니다." });
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

// 질문에 대한 모든 답변 조회 API
router.get('/question/:question_pk', async (req, res) => {
    const question_pk = req.params.question_pk; // 요청에서 질문의 primary key 가져오기

    try {
        // 질문에 대한 모든 답변을 조회하고 사용자 정보와 함께 반환
        const questionAnswers = await Answer.findAll({
            where: { question_pk: question_pk },
            include: {
                model: User, // User 모델
                attributes: ['name'], // 사용자의 이름만 포함
                required: true // 내부 조인으로 설정하여 연결된 사용자가 있는 답변만 검색
            }
        });

        // 적은 답변이 없을 때 예외처리
        if (questionAnswers.length === 0) {
            return res.status(200).json({ message: "아직 답변이 없습니다.", data: questionAnswers });
        } else {
            // 질문에 대한 모든 답변과 사용자 정보 반환
            return res.status(200).json({ message: "질문에 대한 모든 답변을 성공적으로 불러왔습니다.", data: questionAnswers });
        }

    } catch (error) {
        console.error('Error fetching question answers:', error);
        return res.status(500).json({ error: '질문에 대한 답변을 불러오는 중에 오류가 발생했습니다.' });
    }
});

module.exports = router