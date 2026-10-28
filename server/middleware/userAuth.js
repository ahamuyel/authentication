import jwt from 'jsonwebtoken'

const userAuth = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]
    if (!token) {
        return res.json({ success: false, message: 'No token provided. Please log in.' })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (decoded.id) {
            req.body.userId = decoded.id
        } else {
            return res.json({ success: false, message: 'Invalid token. Login again.' })
        }
        next()
    } catch (error) {
        return res.json({ success: false, message: 'Invalid token' })
    }
}

export default userAuth