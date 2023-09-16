const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Meeting = require('../models/Meeting');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Registration failed' });
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User Not Found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        const secretKey = process.env.SECRET_KEY;
        const token = jwt.sign({ userId: user._id, email: user.email }, secretKey, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token, name: user.name});
    } catch (err) {
        res.status(500).json({ message: 'Login failed' });
    }
})

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const secretKey = process.env.SECRET_KEY;
        const resetToken = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

        user.resetToken = resetToken;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD,
            }
        })

        const resetLink = `http://localhost:3000/reset-pass/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_ADDRESS,
            to: user.email,
            subject: 'Password Reset',
            html: `<p>Hello ${user.name},</p><p>Please click on the link below to reset your password:</p>
                    <a href="${resetLink}">${resetLink}</a>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email: ', error);
                return res.status(500).json({ message: 'Failed to send email' });
            }
            console.log('Email sent: ', info.response);
            res.status(200).json({ message: 'Password reset email sent' });
        });
    } catch (err) {
        console.log('Forgot password error: ', err);
        res.status(500).json({ message: 'Forgot password failed' });
    }
});

router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const secretKey = process.env.SECRET_KEY;
        const decodedToken = jwt.verify(token, secretKey);

        const user = await User.findById(decodedToken.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedPassword;
        user.resetToken = null;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        console.log('Reset password error: ', err);
        res.status(500).json({ message: 'Password reset failed' });
    }
})

const generateMeetingCode = async () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const codeLength = 9;

    let code = '';
    for (let i = 0; i < codeLength; i++) {
        const randomInd = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomInd);
    }
    return code;
};

router.post('/creating-meeting', async (req, res) => {
    try {
        const { userId } = req.body;

        const existingMeeting = await Meeting.findOne({ host: userId });

        if (existingMeeting) {
            res.status(200).json({ message: 'Meeting exists', code: existingMeeting.code });
        }
        else {
            const newCode = await generateMeetingCode();

            const newMeeting = new Meeting({
                host: userId,
                code: newCode,
            });

            await newMeeting.save();

            res.status(200).json({ message: 'Meeting created', code: newCode });
        }
    } catch (error) {
        console.log('Error creating meeting', error);
        res.status(500).json({ message: 'Meeting creation failed' });
    }
});

router.get('/get-ownername/:roomCode', async (req, res) => {
    try{
        const {roomCode} = req.params;
        const meeting = await Meeting.findOne({ code: roomCode }).populate('host');

        if(meeting){
            const ownerName = meeting.host.name;
            res.status(200).json({ownerName});
        }
        else {
            res.status(404).json({error: 'Not found'});
        }
    } catch (error){
        console.log('Error', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = router;