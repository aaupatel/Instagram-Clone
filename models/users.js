const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");

mongoose.connect(process.env.MONGODB_URI);
console.log("Connected to DB")

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  picture: {
    type: String,
    default: 'https://ik.imagekit.io/k6ug67pvg/def.png?updatedAt=1724678000874'
  },
  contact: String,
  bio: String,
  stories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "story" 
    }
  ],
  saved: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post" 
    }
  ],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "post" 
  }],
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "notification"
  }],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user" 
    } 
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user" 
    }
  ],
  socketId: {
    type: String,
    default: null
  },
});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);