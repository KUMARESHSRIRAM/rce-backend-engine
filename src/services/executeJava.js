const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const executeJavaCode = async (code, input) => {
    const jobId = uuidv4();
    const jobDir = path.join(__dirname, '../../temp', jobId); 
    const codeFilePath = path.join(jobDir, 'Main.java');
    const inputFilePath = path.join(jobDir, 'input.txt');

    try {
        await fs.mkdir(jobDir, { recursive: true });
        await fs.writeFile(codeFilePath, code);
        await fs.writeFile(inputFilePath, input || '');

        // Docker specific configuration updated to use Eclipse Temurin
        // --rm : Destroy the container immediately after it exits
        // -v : Mount the host's temp directory to /app inside the container
        // -w : Set the working directory inside the container to /app
        // --memory / --cpus : Hard hardware limits to prevent server crashing
        const dockerCmd = `docker run --rm -v "${jobDir}":/app -w /app --memory="256m" --cpus="1" eclipse-temurin:17-alpine sh -c "javac Main.java && java Main < input.txt"`;

        const output = await new Promise((resolve, reject) => {
            // We give Docker 3 seconds total to boot, compile, and run.
            exec(dockerCmd, { timeout: 10000 }, (error, stdout, stderr) => {
                if (error) {
                    if (error.killed) {
                        reject({ status: 'Time Limit Exceeded', message: 'Execution timed out ( > 10000ms ).' });
                    } else {
                        // Captures both compilation and runtime errors from the container
                        reject({ status: 'Execution Error', message: stderr || error.message });
                    }
                } else {
                    resolve(stdout);
                }
            });
        });

        return { success: true, output: output.trim() };

    } catch (err) {
        return { success: false, error: err };
    } finally {
        try {
            await fs.rm(jobDir, { recursive: true, force: true });
        } catch (cleanupErr) {
            console.error(`Failed to clean up job directory ${jobId}:`, cleanupErr.message);
        }
    }
};

module.exports = { executeJavaCode };