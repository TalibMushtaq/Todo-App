const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const User = new Schema({
    UserName: String,
    Password: String,
    email: {type: String, unique: true}
});

const Todo = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    Task: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const UserModel = mongoose.model('users', User);
const TodoModel = mongoose.model('todos', Todo);

module.exports = {
    UserModel,
    TodoModel
};