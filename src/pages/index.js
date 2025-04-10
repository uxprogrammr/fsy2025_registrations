import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated (you can use your own auth check method)
    const isAuthenticated = localStorage.getItem('token') !== null;
    
    // Redirect based on authentication status
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  // Return null or a loading spinner while redirecting
  return null;
} 