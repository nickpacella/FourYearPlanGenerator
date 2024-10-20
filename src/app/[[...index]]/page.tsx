"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SignedIn, SignedOut, SignIn } from '@clerk/nextjs';

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  // add user to database
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

  // redirect if the user is signed in
  useEffect(() => {
    if (isLoaded && userId) {
      // first, add user to the database, then redirect
      addUserToDatabase().then(() => {
        router.push('/home');
      });
    }
  }, [isLoaded, userId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <SignedOut>
        <h1>Please sign in</h1>
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
      </SignedOut>

      <SignedIn>
        <h1>You are signed in!</h1>
      </SignedIn>
    </div>
  );
}
