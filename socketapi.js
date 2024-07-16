const io = require('socket.io')();
const userModel = require('./models/users');
const messageModel = require('./models/message');
const socketapi = {
    io: io
};

io.on('connection', (socket) => {
    socket.on('join-server', async (userId) => {
        console.log(`${userId} connected in chat`);
        await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
        // console.log("socketid = " + socket.id );
    });

    socket.on('send-private-message', async (messageObject) => {
        try {
            const sender = await userModel.findById(messageObject.sender);
            const receiver = await userModel.findById(messageObject.receiver);

            if (!sender || !receiver) {
                console.log('Sender or receiver not found');
                return;
            }

            const message = await messageModel.create({
                sender: sender._id,
                receiver: receiver._id,
                content: messageObject.message,
                date: messageObject.date,
                time: messageObject.time
            });
            // console.log("messagemodel = " + message);

            if (receiver.socketId) {
                io.to(receiver.socketId).emit('receive-private-message', {
                    receiver: messageObject.receiver,
                    sender: messageObject.sender,
                    message: messageObject.message,
                    date: messageObject.date,
                    time: messageObject.time
                });
            }
        } catch (error) {
            console.error('Error in send-private-message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

module.exports = socketapi;