require('dotenv').config();
const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const { connection } = require('./src/config/queue');
const { executeJavaCode } = require('./src/services/executeJava');
const Submission = require('./src/models/Submission');

// The worker needs its own database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Worker connected to MongoDB'))
    .catch(err => console.error('Worker MongoDB connection failed:', err.message));

console.log('Worker is actively listening for jobs in the queue...');

// Listen to the 'submissions' queue
const worker = new Worker('submissions', async job => {
    const { submissionId, code, input } = job.data;
    console.log(`\n[Queue] Picked up submission: ${submissionId}`);

    // Update status to Running
    await Submission.findByIdAndUpdate(submissionId, { status: 'Running' });

    const startTime = Date.now();
    // Fire up the Docker Sandbox
    const result = await executeJavaCode(code, input);
    const executionTime = Date.now() - startTime;

    if (result.success) {
        await Submission.findByIdAndUpdate(submissionId, {
            status: 'Accepted',
            executionTime: executionTime,
            output: result.output
        });
        console.log(`[Success] Submission ${submissionId} Accepted! Execution Time: ${executionTime}ms`);
        console.log(`[Output] ${result.output}`);
    } else {
        await Submission.findByIdAndUpdate(submissionId, {
            status: result.error.status,
            errorMessage: result.error.message,
            executionTime: executionTime
        });
        console.log(`[Failed] Submission ${submissionId} - ${result.error.status}`);
    }
}, { connection });