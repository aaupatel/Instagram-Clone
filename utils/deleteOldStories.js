const mongoose = require('mongoose');
const Story = require("../models/story");

const deleteOldStories = async () => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await Story.deleteMany({ date: { $lt: twentyFourHoursAgo } });
      // console.log('Old stories deleted successfully');
    } catch (error) {
      console.error('Error deleting old stories:', error);
    }
};

module.exports = deleteOldStories;