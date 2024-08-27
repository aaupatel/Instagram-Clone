# Instagram Clone

This project is a web application that mimics some of the core functionalities of Instagram, including chatting, notifications, story and post uploads, liking posts, commenting, and searching for users by username. The app is built using Node.js, Express.js, and MongoDB, with additional tools and libraries for enhanced functionality.

## Features

- **Chat Functionality**: Real-time chat between users with message history.
- **Notifications**: Users receive notifications for likes, follows, unfollows, comments, and replies on their posts.
- **Story and Post Uploads**: Users can upload stories and posts with images.
- **Like and Comment**: Users can like posts, comment on posts, and reply to comments.
- **User Search**: Search functionality to find users by their username.
- **Follow/Unfollow**: Users can follow or unfollow other users.
- **Saved Posts**: Users can save posts to view them later.
- **Cron Jobs**: Automated tasks, like deleting old stories.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: Passport.js with local strategy
- **File Upload**: Multer, ImageKit for storing and serving images
- **Scheduling**: Node-cron for scheduled tasks

## Setup

### Prerequisites

- **Node.js**: Ensure Node.js is installed on your system.
- **MongoDB**: Have MongoDB installed locally or have a MongoDB Atlas account.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aaupatel/Instagram-Clone
   cd Instagram-Clone

2. **Install dependencies**:
   ```bash
   npm install

3. **Create a `.env` file**:
   ```bash
   touch .env

4. **Add the following environment variables in the `.env` file**:

   ```makefile
   MONGODB_URI=<your-mongodb-uri>
   SESSION_SECRET=<your-session-secret>
   IMAGEKIT_PUBLIC_KEY=<your-imagekit-public-key>
   IMAGEKIT_PRIVATE_KEY=<your-imagekit-private-key>
   IMAGEKIT_URL_ENDPOINT=<your-imagekit-url-endpoint>

5. **Run the application**:
   ```bash
   npm start

5. **Access the application**:

   Open your browser and navigate to `http://localhost:3000`.