import express from "express"

const router = express.Router()

router.post('/register',(req, res) => {
    const {email, password} = req.body;
    console.log(email)
})

export default router;