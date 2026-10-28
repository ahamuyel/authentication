import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js';
import resend from '../config/nodemailer.js';

const sendEmail = async ({ to, subject, text }) => {
    try {
        const { error } = await resend.emails.send({
            from: process.env.SENDER_EMAIL,
            to,
            subject,
            text
        })
        if (error) console.log('Email falhou:', error.message)
    } catch (e) {
        console.log('Email falhou:', e.message)
    }
}

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing Details' })
    }
    try {
        const existingUser = await userModel.findOne({ email })
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new userModel({ name, email, password: hashedPassword })
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        await sendEmail({
            to: user.email,
            subject: 'Welcome to Cur10usX!',
            text: `Hello ${user.name},\n\nYour account was created successfully.\n\nBest regards,\nCur10usX`
        })

        return res.json({ success: true })

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.json({ success: false, message: "email and password required" })
    }
    try {
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: 'Invalid email' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid password' })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        await sendEmail({
            to: user.email,
            subject: 'Login Notification',
            text: `Hello ${user.name},\n\nYou logged in to your account.\n\nIf this wasn't you, please secure your account immediately.\n\nBest regards,\nCur10usX`
        })

        return res.json({ success: true })

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        return res.json({ success: true, message: 'Log Out' })
    }
    catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

// Send Verification OTP to the user email
export const sendVerificationOtp = async (req, res) => {
    try{
        const {userId} = req.body;
        const user = await userModel.findById(userId);
        if (user.isAccountVerified) {
            return res.json({ success: false, message: 'Account already verified' })
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // OTP valid for 24 hours
        await user.save();

        await sendEmail({
            to: user.email,
            subject: 'Verification OTP',
            text: `Hello ${user.name},\n\nYour verification OTP is: ${otp}\n\nThis OTP is valid for 24 hours.\n\nBest regards,\nCur10usX`
        })

        res.json({ success: true, message: 'Verification OTP sent to email' })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const verifyAccount = async (req, res) => {
        const { userId, otp } = req.body;
        if (!userId || !otp) {
            return res.json({ success: false, message: 'User ID and OTP are required' })
        }try {
            const user = await userModel.findById(userId);
            if (!user) {
                return res.json({ success: false, message: 'User not found' })
            }
            if (user.verifyOtp === '' || user.verifyOtp !== String(otp)) {
                return res.json({ success: false, message: 'Invalid OTP' })
            }
            if (user.verifyOtpExpireAt < Date.now()) {
                return res.json({ success: false, message: 'OTP has expired' })
            }
            user.isAccountVerified = true;
            user.verifyOtp = '';
            user.verifyOtpExpireAt = 0;
            await user.save();
            return res.json({ success: true, message: 'Account verified successfully' })
        }
        catch (error) {
            return res.json({ success: false, message: error.message })
        }   
    }

export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true, message: 'User is authenticated' })
    }
    catch (error) {
        return res.json({ success: false, message: error.message }) 
    }
}