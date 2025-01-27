import express from 'express'
import {connectToDatabase} from '../lib/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import svgCaptcha from 'svg-captcha'

const router = express.Router()

router.get('/captcha', async (req, res) => {
    const captcha = svgCaptcha.create({
        size: 4,
        noise: 3,
        background: '#cc9966' 
    });

    const captchaToken = jwt.sign(
        { captcha: captcha.text },
        process.env.JWT_KEY,
        { expiresIn: '5m' }
    );

	res.status(200).json({
        captcha: captcha.data,
        token: captchaToken,
    });

    console.log('Captcha text:', captcha.text)
})

const verifyCaptcha = async (req, res, next) => {
    const {captchaToken, captchaInput} = req.body;
    if (!captchaToken || !captchaInput) {
        return res.status(400).json({ message: 'Captcha token and input are required' });
    }
    try {
        const decoded = jwt.verify(captchaToken, process.env.JWT_KEY);

        if (decoded.captcha.toLowerCase() !== captchaInput.toLowerCase()) {
            return res.status(400).json({ message: 'Captcha verification failed' });
        }
        next();
    } catch (error) {
        return res.status(400).json({ message: 'Invalid or expired captcha token' });
    }
 }

router.post('/register', verifyCaptcha, async (req, res) => {
    const {email, password} = req.body;
    try {
        const db = await connectToDatabase()
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email])

        if(rows.length > 0){
            return res.status(409).json({message: "User already exist"})
        }

        const hashPassword = await bcrypt.hash(password, 10)
        await db.query("INSERT INTO users (email, password) VALUES (?,?)", [email, hashPassword])

        res.status(201).json({message: "User created successfully"})

    } catch (error) {
        res.status(500).json(error)
    }
})

router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    try {
        const db = await connectToDatabase()
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email])

        if(rows.length === 0){
            return res.status(404).json({message: "User not exist"})
        }

        const isMatch = await bcrypt.compare(password, rows[0].password)
        if(!isMatch){
            return res.status(401).json({message: "Wrong password"})
        }
        const token = jwt.sign({id: rows[0].id}, process.env.JWT_KEY, {expiresIn: '3h'})

        return res.status(201).json({token: token, message: "User auth successfully"})

    } catch (error) {
        return res.status(500).json(error)
    }
})

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        if(!token){
            return res.status(403).json({message: 'No token provided'})
        }
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userId = decoded.id;
        next()
    } catch (error) {
        return res.status(500).json({message: 'Server side error'})
    }
}

router.get('/home', verifyToken, async (req, res) => {
    try {
        const db = await connectToDatabase()
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.userId])

        if(rows.length === 0){
            return res.status(404).json({message: "User not exists"})
        }

        return res.status(201).json({user: rows[0]})

    } catch (error) {
        return res.status(500).json({messsage: "Server error"})
    }
})

export default router;