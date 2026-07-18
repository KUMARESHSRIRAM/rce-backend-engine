const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    language: { type: String, required: true }, // We will default to 'java' in our tests
    code: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Running', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error', 'Runtime Error'],
        default: 'Pending'
    },
    executionTime: { type: Number },
    errorMessage: { type: String },
    output: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);