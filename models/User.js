// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  moodHistory: [
    {
      date: { type: Date, default: Date.now },
      mood: String,
    }
  ]
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
