"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  // Function to add user to the database
  const addUserToDatabase = async () => {
    try {
      const response = await fetch('/api/addUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('User added to database');
      } else {
        console.error('Failed to add user to database');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Redirect if the user is signed in
  useEffect(() => {
    if (isLoaded && userId) {
      addUserToDatabase().then(() => {
        router.push('/home');
      });
    }
  }, [isLoaded, userId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
      <SignedOut>
        <div className="flex flex-col items-center justify-center h-full text-center bg-white shadow-lg p-10 rounded-lg">
          <h1 className="text-6xl font-extrabold text-indigo-600 mb-8 leading-relaxed">Welcome to the <br /> Four Year Plan Generator!</h1>
          <p className="text-3xl text-gray-700 mb-4">
            Please sign in to access your four-year plans.
          </p>
          <SignInButton>
            <button className="mt-4 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <h1 className="text-4xl font-extrabold text-green-600">Welcome back</h1>
      </SignedIn>
    </div>
  );
}
