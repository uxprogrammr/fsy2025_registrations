import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // Check if the user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/dashboard');
        }
    }, []);

    // Load saved credentials if rememberMe is enabled
    useEffect(() => {
        const savedUsername = localStorage.getItem('savedUsername');
        const savedPassword = localStorage.getItem('savedPassword');
        if (savedUsername && savedPassword) {
            setUsername(savedUsername);
            setPassword(savedPassword);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async () => {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            const result = await response.json();
            if (result.success) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('fullName', result.fullName);

                // Save credentials if Remember Me is checked
                if (rememberMe) {
                    localStorage.setItem('savedUsername', username);
                    localStorage.setItem('savedPassword', password);
                } else {
                    localStorage.removeItem('savedUsername');
                    localStorage.removeItem('savedPassword');
                }

                router.push('/dashboard');  // Redirect to the dashboard after login
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="p-8 bg-white rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6">Login</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <input
                    type="text"
                    placeholder="Email or Phone Number"
                    className="w-full p-2 mb-4 border rounded text-gray-900"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="6-digit PIN"
                    className="w-full p-2 mb-4 border rounded text-gray-900"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <div className="flex items-center mb-4">
                    <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="mr-2"
                    />
                    <label htmlFor="rememberMe" className="text-gray-900">Remember Me</label>
                </div>

                <button
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    onClick={handleLogin}
                >
                    Login
                </button>

                <div className="mt-4 flex justify-between">
                    <Link href="/participant-signup" className="text-blue-500 hover:underline">
                        Participant Sign Up
                    </Link>
                    <Link href="/counselor-signup" className="text-blue-500 hover:underline">
                        Counselor Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
}
