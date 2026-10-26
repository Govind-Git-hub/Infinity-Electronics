const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log("Mongodb DB Connected Successfully!");
    }).catch((error) => {
        console.log("DB not Connected", error);
                process.exit(1);

    });
};

module.exports = connectDB;