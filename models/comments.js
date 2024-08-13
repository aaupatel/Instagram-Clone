const mongoose = require('mongoose');

const replySchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
  ]
});

const commentSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
  ],
  replies: [replySchema]
});

module.exports = mongoose.model('comment', commentSchema);
