import { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const DEFAULT_CODE = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int a = sc.nextInt();
            int b = sc.nextInt();
            System.out.println("The sum is: " + (a + b));
        } else {
            System.out.println("No input provided.");
        }
        sc.close();
    }
}`;

function App() {
    const [code, setCode] = useState(DEFAULT_CODE);
    const [input, setInput] = useState('15 27');
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState('Idle');
    const [isPolling, setIsPolling] = useState(false);

    const handleRunCode = async () => {
        setStatus('Queued...');
        setOutput('');
        setIsPolling(true);

        try {
            const response = await axios.post('http://localhost:3000/api/submissions/run', {
                code,
                input
            });
            
            const { submissionId } = response.data;
            pollSubmission(submissionId);

        } catch (error) {
            console.error(error);
            setStatus('Server Error');
            setIsPolling(false);
        }
    };

    const pollSubmission = (submissionId) => {
        const interval = setInterval(async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/submissions/${submissionId}`);
                const submission = response.data.data;

                setStatus(submission.status);

                if (submission.status === 'Accepted' || submission.status.includes('Error') || submission.status === 'Time Limit Exceeded') {
                    clearInterval(interval);
                    setIsPolling(false);
                    setOutput(submission.output || submission.errorMessage || 'No output.');
                }
            } catch (error) {
                console.error('Polling error', error);
                clearInterval(interval);
                setIsPolling(false);
            }
        }, 1000); 
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#1e1e1e', color: '#fff', fontFamily: 'sans-serif' }}>
            
            <div style={{ width: '40%', padding: '20px', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
                <h2>Two Sum (Example)</h2>
                <p>Write a Java program that reads two integers from standard input and prints their sum.</p>
                
                <h3 style={{ marginTop: 'auto' }}>Standard Input</h3>
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{ width: '100%', height: '100px', backgroundColor: '#2d2d2d', color: '#fff', border: 'none', padding: '10px' }}
                />
            </div>

            <div style={{ width: '60%', display: 'flex', flexDirection: 'column' }}>
                
                <div style={{ height: '70%' }}>
                    <Editor
                        height="100%"
                        language="java"
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value)}
                        options={{ fontSize: 14, minimap: { enabled: false } }}
                    />
                </div>

                <div style={{ height: '30%', backgroundColor: '#000', padding: '20px', borderTop: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 'bold', color: status === 'Accepted' ? '#4caf50' : '#f44336' }}>
                            Status: {status}
                        </span>
                        <button 
                            onClick={handleRunCode} 
                            disabled={isPolling}
                            style={{ padding: '10px 20px', backgroundColor: isPolling ? '#555' : '#4caf50', color: '#fff', border: 'none', cursor: isPolling ? 'not-allowed' : 'pointer' }}
                        >
                            {isPolling ? 'Running...' : 'Run Code'}
                        </button>
                    </div>
                    <pre style={{ flexGrow: 1, overflowY: 'auto', margin: 0, color: '#ccc' }}>
                        {output}
                    </pre>
                </div>

            </div>
        </div>
    );
}

export default App;