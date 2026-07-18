const { submissionQueue } = require('../config/queue');
const Submission = require('../models/Submission');
const mongoose = require('mongoose');

const submitCode = async (req, res) => {
    const { code, input } = req.body;

    if (!code) {
        return res.status(400).json({ success: false, error: 'Code is required.' });
    }

    try {
        // 1. Save to Database as 'Pending'
        // Note: We are generating a dummy Problem ID for now to bypass creating problems
        const newSubmission = await Submission.create({
            problemId: new mongoose.Types.ObjectId(), 
            language: 'java',
            code: code,
            status: 'Pending'
        });

        // 2. Push the job to the Redis Queue
        await submissionQueue.add('execute-java', {
            submissionId: newSubmission._id,
            code: code,
            input: input
        });

        // 3. Immediately respond to the user (No blocking!)
        return res.status(200).json({ 
            success: true, 
            message: 'Code submitted successfully. Execution queued.',
            submissionId: newSubmission._id
        });
    } catch (error) {
        console.error('Submission Error:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

module.exports = { submitCode };
// NEW FUNCTION: Fetch the submission status and result
const getSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Fetch the document from MongoDB
        const submission = await Submission.findById(id);

        if (!submission) {
            return res.status(404).json({ success: false, error: 'Submission not found.' });
        }

        return res.status(200).json({ 
            success: true, 
            data: submission 
        });
    } catch (error) {
        console.error('Fetch Error:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// Don't forget to export the new function!
module.exports = { submitCode, getSubmission };