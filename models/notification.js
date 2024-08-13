const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, 
  type: { type: String, enum: ['like', 'unlike', 'follow', 'unfollow', 'comment', 'reply'], required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, 
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'post' }, 
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'comment' },
  reply: { type: mongoose.Schema.Types.ObjectId, ref: 'comment.replies'},
  replyText: {type: String},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("notification", notificationSchema);