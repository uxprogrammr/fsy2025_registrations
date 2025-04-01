import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import '@/styles/global.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

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
                router.push('/');
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
                <h2 className="text-2xl font-bold mb-6">Registration Admin Login</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <input
                    type="text"
                    placeholder="Email"
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

                <button
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    onClick={handleLogin}
                >
                    Login
                </button>

                <div className="mt-4 text-center">
                    <Link href="/counselor-signup" className="text-blue-500 hover:underline">
                        Counselor Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
}
