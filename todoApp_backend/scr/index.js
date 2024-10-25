const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { auth, JWT_SECRET } = require("./middleware/auth");
const { UserModel, TodoModel } = require("./models/database");
const { todoStatusHandler } = require("./controllers/todoController");
const { signupSchema, signinSchema, todoSchema } = require("./validators/schemas");
const jwt = require("jsonwebtoken");

// Initialize Express application
const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect("");

// Signup Route
app.post("/signup", async function (req, res) {
    const safeparsedDatat = signupSchema.safeParse(req.body);

    if (!safeparsedDatat.success) {
        res.json({
            message: "Invalid Inputs",
            error: safeparsedDatat.error
        });
        return;
    }

    const { UserName, Password, email } = req.body;

    try {
        const existingUser = await UserModel.findOne({ email });  
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(Password, 5);

        await UserModel.create({
            UserName,
            Password: hashedPassword,
            email
        });

        res.status(201).json({
            message: "User Created Successfully"
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

// Signin Route
app.post("/signin", async function(req, res) {
    const safeparsedDatat = signinSchema.safeParse(req.body);

    if (!safeparsedDatat.success) {
        res.json({
            message: "Invalid Inputs",
            error: safeparsedDatat.error
        });
        return;
    }

    const { email, Password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
        res.status(403).json({
            message: "User does not exist in DataBase"
        });
        return;
    }

    const passwordMatch = await bcrypt.compare(Password, user.Password)

    if (passwordMatch) {
        const token = jwt.sign({
            id: user._id.toString()
        }, JWT_SECRET);

        res.json({ token })
    } else {
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }
});

// Create Todo Route
app.post("/todo", auth, async function(req, res) {
    try {
        const safeParsedData = todoSchema.safeParse(req.body);
        
        if(!safeParsedData.success) {
            return res.json({
                message: "invalid input",
                error: safeParsedData.error
            });
        }

        const newTodo = await TodoModel.create({
            Task: safeParsedData.data.Task,
            status: safeParsedData.data.status,
            userId: req.userId
        });

        return res.json({
            message: "Task Created",
            taskId: newTodo._id.toString()
        });

    } catch (error) {
        console.error("Error creating todo:", error);
        return res.status(500).json({
            message: "Error creating task",
            error: error.message
        });
    }
});

// Update Todo Status Route
app.put("/todo/status", auth, todoStatusHandler);

// Get All Todos Route
app.get("/todos", auth, async function(req, res) {
    try {
        const todos = await TodoModel.find({ userId: req.userId });
        
        if (todos.length === 0) {
            return res.status(404).json({
                message: "No todos found for this user"
            });
        }

        res.json({
            message: "Todos fetched successfully",
            todos: todos
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error, please try again later",
            error: error.message  
        });
    }
});

// Start server
app.listen(5500, () => console.log("Server running on localhost:3000"));
