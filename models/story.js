const mongoose = require('mongoose');

const viewerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  viewCount: { type: Number, default: 0 }
});

const storySchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  story: String,
  date: {
    type: Date,
    default: Date.now
  },
  viewers: [viewerSchema]
})

module.exports = mongoose.model("story", storySchema);