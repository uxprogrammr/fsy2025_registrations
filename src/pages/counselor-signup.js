import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function CounselorSignUp() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    // Check if the user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/dashboard');
        }
    }, []);

    const handleSignUp = async () => {
        if (pin !== confirmPin) {
            setError('PIN codes do not match');
            return;
        }

        try {
            const response = await fetch('/api/counselor-signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fullName, email, mobileNumber, birthDate, pin }),
            });
            const result = await response.json();

            if (result.success) {
                setSuccess('Account created successfully!');
                //router.push('/login');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Sign up failed. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="p-8 bg-white rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6">Counselor Sign Up</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">{success}</p>}
                <input type="text" placeholder="Full Name" className="w-full p-2 mb-4 border rounded text-gray-900" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <input type="email" placeholder="Email Address" className="w-full p-2 mb-4 border rounded text-gray-900" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="text" placeholder="Mobile Number" className="w-full p-2 mb-4 border rounded text-gray-900" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
                <input type="date" placeholder="Birth Date" className="w-full p-2 mb-4 border rounded text-gray-900" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                <input type="password" placeholder="6-digit PIN" className="w-full p-2 mb-4 border rounded text-gray-900" value={pin} onChange={(e) => setPin(e.target.value)} />
                <input type="password" placeholder="Confirm 6-digit PIN" className="w-full p-2 mb-4 border rounded text-gray-900" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} />
                <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600" onClick={handleSignUp}>Sign Up</button>
                <div className="mt-4 text-center">
                    <Link href="/login" className="text-blue-500 hover:underline">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
