import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true }, 
  text: { type: String, required: true },
  time: { type: Date, default: Date.now }
});

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  messages: [messageSchema], 
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Session || mongoose.model('Session', sessionSchema);
