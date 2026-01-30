import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  })
}

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role === 'admin' ? 'admin' : 'staff'
    })

    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      user: user.toJSON(),
      token
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generateToken(user._id)

    res.json({
      success: true,
      user: user.toJSON(),
      token
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    res.json({ user: user.toJSON() })
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
