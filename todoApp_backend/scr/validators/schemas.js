const { z } = require("zod");

const signupSchema = z.object({
    email: z.string().max(25).email(),
    UserName: z.string().min(3).max(20),
    Password: z.string().min(8).max(16)
});

const signinSchema = z.object({
    email: z.string().max(25).email(),
    Password: z.string().min(8).max(16)
});

const todoSchema = z.object({
    Task: z.string().min(5).max(30),
    status: z.string().transform(val => val.toLowerCase() === "true")
});

module.exports = {
    signupSchema,
    signinSchema,
    todoSchema
};