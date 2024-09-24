"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SignedIn, SignedOut, SignIn } from '@clerk/nextjs';

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  // redirect if the user is signed in
  useEffect(() => {
    if (isLoaded && userId) {
      router.push('/home');
    }
  }, [isLoaded, userId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <SignedOut>
        <h1>please sign in</h1>
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
      </SignedOut>

      <SignedIn>
        <h1>you are signed in!</h1>
      </SignedIn>
    </div>
  );
}
