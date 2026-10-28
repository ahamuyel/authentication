import express from 'express'
import { register, login, logout, sendVerificationOtp, verifyAccount, isAuthenticated } from '../controllers/authController.js'
import userAuth from '../middleware/userAuth.js'
const authRouter = express.Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/send-verification-otp', userAuth, sendVerificationOtp)
authRouter.post('/verify-account', userAuth, verifyAccount)
authRouter.post('/is-authenticated', userAuth, isAuthenticated)