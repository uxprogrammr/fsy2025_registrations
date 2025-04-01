import { useRouter } from 'next/router';

export default function SignOutButton() {
    const router = useRouter();

    const handleSignOut = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <div className="flex justify-end">
            <button
                onClick={handleSignOut}
                className="text-black"
            >
                Sign Out
            </button>
        </div>
    );
}
