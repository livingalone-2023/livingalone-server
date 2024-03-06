const express = require('express');
const { Answer } = require('../models');// index는 파일 이름 생략 가능 
const { Op } = require("sequelize");
const session = require('express-session');
const crypto = require('crypto');

const router = express.Router();

//답변 작성 api
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
})


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
    return res.status(500).json({"message":"답변 수정이 정상적으로 실패하였습니다."})
    //console.log(error);
}
})
module.exports = router