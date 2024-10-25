const { TodoModel } = require('../models/database');
const { z } = require("zod");
const mongoose = require('mongoose');

async function todoStatusHandler(req, res) {
    const { id, status } = req.body;
   
    const requiredBody = z.object({
        id: z.string(),
        status: z.string().transform(val => val.toLowerCase() === "true")
    });

    const safeparsedData = requiredBody.safeParse(req.body);

    if(!safeparsedData.success){
        res.json({
            message: "invalid input",
            error: safeparsedData.error
        });
    }

    const normalizedStatus = typeof status === 'string'
        ? status.toLowerCase() === 'true'
        : Boolean(status);
   
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid todo ID format"
            });
        }

        const todo = await TodoModel.findOneAndUpdate(
            {
                _id: id,
                userId: req.userId  
            },
            { status: normalizedStatus },
            {
                new: true,
                runValidators: true
            }
        );

        if (!todo) {
            return res.status(404).json({
                message: "Todo not found or access denied"
            });
        }

        res.json({
            message: "Status updated successfully",
            todo
        });
    } catch (error) {
        console.error("Error updating task status:", error);
       
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: "Invalid todo ID format"
            });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Invalid status value"
            });
        }
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    todoStatusHandler
};