import mongoose from 'mongoose'

const roasterProfileSchema = new mongoose.Schema({
  name: String,
  profileLink: String,
  platform: String,
  followers: {
    type: Number,
    default: 0
  },
  followersDisplay: String,
  state: String,
  category: String,
  commercials: String,
  phoneNumber: String,
  sex: String,
  age: Number,
  email: String,
  response: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

// Index for faster queries
roasterProfileSchema.index({ userId: 1 })
roasterProfileSchema.index({ status: 1 })

export default mongoose.model('RoasterProfile', roasterProfileSchema)
