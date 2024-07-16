const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, 
  type: { type: String, enum: ['like', 'unlike', 'follow', 'unfollow', 'comment'], required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, 
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'post' }, 
  comment: { type: String }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("notification", notificationSchema);