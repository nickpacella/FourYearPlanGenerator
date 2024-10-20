"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SignedIn, SignedOut, SignIn } from '@clerk/nextjs';

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
      // First, add the user to the database, then redirect
      addUserToDatabase().then(() => {
        router.push('/home');
      });
    }
  }, [isLoaded, userId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
      <SignedOut>
        <div className="flex flex-col items-center text-center bg-white shadow-lg p-10 rounded-lg">
          <h1 className="text-4xl font-extrabold text-indigo-600 mb-6">Welcome Back!</h1>
          <p className="text-lg text-gray-700 mb-4">
            Please sign in to access your schedule.
          </p>
          <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        </div>
      </SignedOut>

      <SignedIn>
        <h1 className="text-4xl font-extrabold text-green-600">You are signed in!</h1>
      </SignedIn>
    </div>
  );
}
