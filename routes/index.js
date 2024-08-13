const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local");
const cron = require('node-cron');
const userModel = require("../models/users");
const messageModel = require("../models/message");
const postModel = require("../models/posts");
const storyModel = require("../models/story");
const Notification = require("../models/notification");
const commentModel = require('../models/comments');

passport.use(new localStrategy(userModel.authenticate()));
const upload = require("../utils/multer");
const utils = require("../utils/utils");
const deleteOldStories = require('../utils/deleteOldStories'); 

cron.schedule('*/10 * * * * *', () => {
  deleteOldStories();
});

// GET
router.get("/", function (req, res) {
  res.render("index", { footer: false });
});

router.get('/chat/history', async (req, res) => {
  try {
      const { sender, receiver } = req.query;

      if (!sender || !receiver) {
          return res.status(400).json({ message: 'Sender and receiver are required' });
      }

      const messages = await messageModel.find({
          $or: [
              { sender, receiver },
              { sender: receiver, receiver: sender }
          ]
      }).sort('createdAt').populate('sender receiver');

      res.json(messages);
  } catch (error) {
      console.error('Error fetching chat history:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

router.get("/login", function (req, res) {
  res.render("login", { footer: false });
});

router.get("/like/:postid", async function (req, res) {
  const post = await postModel.findOne({ _id: req.params.postid });
  const user = await userModel.findOne({ username: req.session.passport.user });

  if (post.like.indexOf(user._id) === -1) {
    post.like.push(user._id);

    const notification = await Notification.create({
      type: 'like',
      user: post.user,
      fromUser: user._id,
      post: post._id
    });

    const postOwner = await userModel.findById(post.user);
    postOwner.notifications.push(notification._id);
    await postOwner.save();

  } else {
    post.like.splice(post.like.indexOf(user._id), 1);

    await Notification.deleteOne({
      type: 'like',
      user: post.user,
      fromUser: user._id,
      post: post._id
    });
  }

  await post.save();
  res.json(post);
});

router.get("/feed", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");

    const followingUsers = user.following;
    const stories = await storyModel.find({ user: { $in: followingUsers } }).populate("user");

    const uniqueStories = stories.filter((story, index, self) =>
      index === self.findIndex((s) => (
        s.user.id === story.user.id
      ))
    );

    const lastReceivedMessageCount = await countLastReceivedMessages(user._id);

    const posts = await postModel.find()
      .populate("user")
      .populate({
        path: 'comments',
        populate: [
          { path: 'user' },
          { path: 'replies.user' }
        ]
      });

    res.render("feed", {
      footer: true,
      user,
      posts,
      stories: uniqueStories,
      dater: utils.formatRelativeTime,
      lastReceivedMessageCount
    });
  } catch (error) {
    console.error('Error in /feed route:', error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/profile", isLoggedIn, async function (req, res) {
  let user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts")
    .populate("saved");
  //console.log(user);

  res.render("profile", { footer: true, user });
});

router.get("/profile/:userid", isLoggedIn, async function (req, res) {
  try {
    let user = await userModel.findOne({ username: req.session.passport.user });

    if (user._id.equals(req.params.userid)) {
      return res.redirect("/profile"); 
    }

    let userprofile = await userModel
      .findOne({ _id: req.params.userid })
      .populate("posts");

    res.render("userprofile", { footer: true, userprofile, user });
  } catch (error) {
    console.error('Error in /profile/:userid route:', error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/follow/:userid", isLoggedIn, async function (req, res) {
  let followKarneWaala = await userModel.findOne({ username: req.session.passport.user });
  let followHoneWaala = await userModel.findOne({ _id: req.params.userid });

  if (followKarneWaala.following.indexOf(followHoneWaala._id) !== -1) {
    let index = followKarneWaala.following.indexOf(followHoneWaala._id);
    followKarneWaala.following.splice(index, 1);

    let index2 = followHoneWaala.followers.indexOf(followKarneWaala._id);
    followHoneWaala.followers.splice(index2, 1);
    // console.log(followKarneWaala.username + " unfollowed you");

    const notification = await Notification.create({
      user: followHoneWaala._id,
      fromUser: followKarneWaala._id,
      type: "unfollow"
    });

    followHoneWaala.notifications.push(notification._id);
    await followHoneWaala.save();

  } else {
    followHoneWaala.followers.push(followKarneWaala._id);
    followKarneWaala.following.push(followHoneWaala._id);

    const notification = await Notification.create({
      type: 'follow',
      user: followHoneWaala._id,
      fromUser: followKarneWaala._id
    });

    followHoneWaala.notifications.push(notification._id);
    await followHoneWaala.save();
    // console.log(`${followKarneWaala.username} started following you`);
  }

  await followKarneWaala.save();

  res.redirect("back");
});

router.get("/search", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user });
  res.render("search", { footer: true, user });
});

router.get("/save/:postid", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user });

  if (user.saved.indexOf(req.params.postid) === -1) {
    user.saved.push(req.params.postid);
  } else {
    var index = user.saved.indexOf(req.params.postid);
    user.saved.splice(index, 1);
  }
  await user.save();
  res.json(user);
});

router.get("/search/:user", isLoggedIn, async function (req, res) {
  const searchTerm = `^${req.params.user}`;
  const regex = new RegExp(searchTerm);

  let users = await userModel.find({ username: { $regex: regex } });

  res.json(users);
});

router.get("/edit", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("edit", { footer: true, user });
});

router.get("/upload", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user });
  res.render("upload", { footer: true, user });
});

router.get("/inbox", isLoggedIn, async function (req, res) {
  try {
    let loggedInUser = await userModel.findOne({ username: req.session.passport.user });

    let allUsers = await userModel.find({ _id: { $ne: loggedInUser._id } }); 

    let userLastMessages = [];

    for (let user of allUsers) {
      let lastSentMsg = await messageModel.findOne({
        sender: loggedInUser._id,
        receiver: user._id
      }).sort({ createdAt: -1 });

      let lastReceivedMsg = await messageModel.findOne({
        sender: user._id,
        receiver: loggedInUser._id
      }).sort({ createdAt: -1 });

      let lastMsg;
      if (lastSentMsg && lastReceivedMsg) {
        lastMsg = lastSentMsg.createdAt > lastReceivedMsg.createdAt ? lastSentMsg : lastReceivedMsg;
      } else {
        lastMsg = lastSentMsg || lastReceivedMsg;
      }

      userLastMessages.push({
        user,
        lastMsg
      });
    }

    userLastMessages.sort((a, b) => {
      if (!a.lastMsg && !b.lastMsg) return 0;
      if (!a.lastMsg) return 1;
      if (!b.lastMsg) return -1;
      return b.lastMsg.createdAt - a.lastMsg.createdAt;
    });

    res.render("inbox", {
      footer: false,
      user: loggedInUser,
      userLastMessages,
      dater: utils.formatRelativeTime
    });
  } catch (err) {
    console.error("Error fetching inbox data:", err);
    res.status(500).send("Error fetching inbox data");
  }
});

router.get("/chat/:user", isLoggedIn, async function (req, res) {
  try {
    const followerUser = await userModel.findById(req.params.user);
    const loggedInUser = await userModel.findOne({ username: req.session.passport.user });

    if (!followerUser || !loggedInUser) {
     return res.status(404).send("User not found");
    }

    res.render("chat", {
      footer: false,
      followerUser,
      loggedInUser,
      dater: utils.formatRelativeTime,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/notifications", isLoggedIn, async function (req, res) {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ user: userId })
      .populate('fromUser', 'username picture')
      .populate('post', 'picture')
      .populate('comment', 'text')
      .sort({ createdAt: -1 });

    res.render("notifications", {
      footer: false,
      user: req.user,
      notifications: notifications,
      dater: utils.formatRelativeTime,
    });
  } catch (error) {
    console.error("Error in /notifications route:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/userstory', isLoggedIn, async (req, res) => {
  try {
    let userProfile = await userModel.findOne({ username: req.session.passport.user })
      .populate({
        path: 'stories',
        populate: {
          path: 'viewers.userId',
          model: 'user',
          select: 'username picture',
        },
      });

    if (!userProfile) {
      return res.status(404).send("User profile not found");
    }

    res.render('userstory', {
      user: userProfile,
      stories: userProfile.stories,
      footer: false,
      dater: utils.formatRelativeTime, 
    });
  } catch (error) {
    console.error('Error fetching user stories:', error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/story/:userId', isLoggedIn, async (req, res) => {
  try {
    const loggedInUser = await userModel.findOne({ username: req.session.passport.user }).populate('following');
    if (!loggedInUser) {
      return res.status(404).send("Logged-in user not found");
    }
    const userId = req.params.userId;

    if (loggedInUser._id.equals(userId)) {
      return res.redirect("/userstory");
    }
    
    const userToView = await userModel.findById(userId);
    if (!userToView) {
      return res.status(404).send("User not found");
    }

    const stories = await storyModel.find({ user: userToView._id }).sort({ date: -1 }).populate('user');

    res.render('story', { 
      stories,
      footer: false,
      dater: utils.formatRelativeTime,
      viewerUserId: loggedInUser._id,
    });
  } catch (error) {
    console.error('Error in /story/:userId route:', error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/update", isLoggedIn, async function (req, res) {
  const user = await userModel.findOneAndUpdate(
    { username: req.session.passport.user },
    { username: req.body.username, name: req.body.name, bio: req.body.bio },
    { new: true }
  );
  req.login(user, function (err) {
    if (err) throw err;
    res.redirect("/profile");
  });
});

router.post("/post", isLoggedIn, upload.single("image"), async function (req, res) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    if (req.body.category === "post") {
      const post = await postModel.create({
        user: user._id,
        caption: req.body.caption,
        picture: req.file.filename,
      });
      user.posts.push(post._id);
    } else if (req.body.category === "story") {
      let story = await storyModel.create({
        story: req.file.filename,
        user: user._id,
      });
      user.stories.push(story._id);
    } else {
      res.send("tez mat chalo");
    }

    await user.save();
    res.redirect("/feed");
  }
);

router.post("/upload", isLoggedIn, upload.single("image"), async function (req, res) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    user.picture = req.file.filename;
    await user.save();
    res.redirect("/edit");
  }
);

router.post("/register", function (req, res) {
  const user = new userModel({
    username: req.body.username,
    email: req.body.email,
    name: req.body.name,
  });

  userModel.register(user, req.body.password).then(function (registereduser) {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/feed",
    failureRedirect: "/login",
}));

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

router.get("/notifications/clear-all", isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });

    await Notification.deleteMany({ user: user._id });
    user.notifications = [];
    await user.save();

    res.redirect('/notifications');
  } catch (error) {
    console.error("Error in /notifications/clear-all route:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post('/storyview', isLoggedIn, async (req, res) => {
  try {
    const { viewerUserId, storyId } = req.body;

    const story = await storyModel.findById(storyId);

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    let viewer = story.viewers.find(v => v.userId.equals(viewerUserId));
    if (viewer) {
      viewer.viewCount += 1;
    } else {
      story.viewers.push({ userId: viewerUserId, viewCount: 1 });
    }

    await story.save();
    res.json({ message: 'Story view recorded successfully' });
  } catch (error) {
    console.error('Error in /storyview route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/stories/:id', isLoggedIn, async (req, res) => {
  try {
    const storyId = req.params.id;
    await storyModel.findByIdAndDelete(storyId);
    res.status(200).send("Story deleted");
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).send("Internal Server Error");
  }
});

router.post('/:postId/comment', async (req, res) => {
  try {
    const { text } = req.body;
    const { postId } = req.params;
    const userId = req.user._id;

    const comment = new commentModel({
      user: userId,
      post: postId,
      text,
      date: new Date()
    });

    const savedComment = await comment.save();
    await postModel.findByIdAndUpdate(postId, {
      $push: { comments: savedComment._id }
    });

    const populatedComment = await commentModel.findById(savedComment._id).populate('user');

    const post = await postModel.findById(postId);
    if (!post.user.equals(userId)) {
      const notification = await Notification.create({
        type: 'comment',
        user: post.user,
        fromUser: userId,
        post: postId,
        comment: savedComment._id
      });

      const postOwner = await userModel.findById(post.user);
      postOwner.notifications.push(notification._id);
      await postOwner.save();
    }

    res.status(200).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:commentId/reply', async (req, res) => {
  try {
    const { text ,postId} = req.body;
    const { commentId } = req.params;
    const userId = req.user._id;

    const reply = {
      user: userId,
      text,
      date: new Date(),
      post: postId
    };

    const updatedComment = await commentModel.findByIdAndUpdate(
      commentId,
      { $push: { replies: reply } },
      { new: true }
    ).populate('replies.user');

    const newReply = updatedComment.replies[updatedComment.replies.length - 1];

    if (!updatedComment.user.equals(userId)) {
      const notification = await Notification.create({
        type: 'reply',
        user: updatedComment.user,
        fromUser: userId,
        reply: newReply._id,
        post: postId,
        replyText: text
      });

      const commentOwner = await userModel.findById(updatedComment.user);
      commentOwner.notifications.push(notification._id);
      await commentOwner.save();
    }

    res.status(200).json(newReply);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/likeComment/:commentId', isLoggedIn, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user._id; 

    const comment = await commentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const hasLiked = comment.likes.includes(userId);

    if (hasLiked) {
      comment.likes = comment.likes.filter(id => !id.equals(userId));
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.status(200).json({ message: 'Success', likes: comment.likes.length, hasLiked: !hasLiked });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/likeReply/:replyId', isLoggedIn, async (req, res) => {
  try {
    const replyId = req.params.replyId;
    const userId = req.user._id;

    const comment = await commentModel.findOne({ 'replies._id': replyId });
    if (!comment) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const hasLiked = reply.likes.includes(userId);

    if (hasLiked) {
      reply.likes = reply.likes.filter(id => !id.equals(userId));
    } else {
      reply.likes.push(userId);
    }

    await comment.save();

    res.status(200).json({ message: 'Success', likes: reply.likes.length, hasLiked: !hasLiked });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

async function countLastReceivedMessages(userId) {
  try {
    const receivedMessages = await messageModel.find({ receiver: new mongoose.Types.ObjectId(userId) })
      .sort({ sender: 1, createdAt: -1 });

    const sentMessages = await messageModel.find({ sender: new mongoose.Types.ObjectId(userId) })
      .sort({ receiver: 1, createdAt: -1 });

    const lastSentTimestamps = new Map();
    sentMessages.forEach(message => {
      if (!lastSentTimestamps.has(message.receiver.toString())) {
        lastSentTimestamps.set(message.receiver.toString(), message.createdAt);
      }
    });

    const uniqueSenders = new Set();
    const lastReceivedMessages = [];

    receivedMessages.forEach(message => {
      const senderId = message.sender.toString();
      if (!uniqueSenders.has(senderId)) {
        const lastSentTime = lastSentTimestamps.get(senderId);

        if (!lastSentTime || message.createdAt > lastSentTime) {
          uniqueSenders.add(senderId);
          lastReceivedMessages.push(message);
        }
      }
    });
    //console.log(lastReceivedMessages);

    const count = lastReceivedMessages.length;
    //console.log(`Total last received messages: ${count}`);
    return count;
  } catch (error) {
    console.error('Error counting last received messages:', error);
    return 0;
  }
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

module.exports = router;