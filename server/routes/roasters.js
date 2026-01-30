import express from 'express'
import RoasterProfile from '../models/RoasterProfile.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// Get all roaster profiles for the authenticated user
router.get('/', async (req, res) => {
  try {
    const roasters = await RoasterProfile.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
    res.json(roasters)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single roaster profile
router.get('/:id', async (req, res) => {
  try {
    const roaster = await RoasterProfile.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
    
    if (!roaster) {
      return res.status(404).json({ error: 'Roaster profile not found' })
    }
    
    res.json(roaster)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create single roaster profile
router.post('/', async (req, res) => {
  try {
    const roaster = await RoasterProfile.create({
      ...req.body,
      userId: req.user._id
    })
    res.status(201).json(roaster)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Create multiple roaster profiles (bulk import)
router.post('/bulk', async (req, res) => {
  try {
    const roasters = req.body.roasters || []
    
    if (!Array.isArray(roasters) || roasters.length === 0) {
      return res.status(400).json({ error: 'Invalid roasters array' })
    }

    const roastersWithUserId = roasters.map(roaster => ({
      ...roaster,
      userId: req.user._id
    }))

    const createdRoasters = await RoasterProfile.insertMany(roastersWithUserId)
    res.status(201).json(createdRoasters)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update roaster profile
router.put('/:id', async (req, res) => {
  try {
    const roaster = await RoasterProfile.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!roaster) {
      return res.status(404).json({ error: 'Roaster profile not found' })
    }
    
    res.json(roaster)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete single roaster profile
router.delete('/:id', async (req, res) => {
  try {
    const roaster = await RoasterProfile.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    })
    
    if (!roaster) {
      return res.status(404).json({ error: 'Roaster profile not found' })
    }
    
    res.json({ message: 'Roaster profile deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Clear all roaster profiles for user
router.delete('/clear/all', async (req, res) => {
  try {
    const result = await RoasterProfile.deleteMany({ userId: req.user._id })
    res.json({ 
      message: 'All roaster profiles cleared successfully',
      deletedCount: result.deletedCount
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
