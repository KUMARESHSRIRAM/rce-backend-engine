const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    // E.g., Java typically gets 2000ms, C++ gets 1000ms
    timeLimit: { type: Number, default: 2000 }, 
    memoryLimit: { type: Number, default: 256 }, // in MB
    testCases: [
        {
            input: { type: String, required: true },
            expectedOutput: { type: String, required: true }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);