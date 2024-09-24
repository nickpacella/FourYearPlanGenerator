import { auth } from '@clerk/nextjs/server';

export default function HomePage() {
  const { userId } = auth();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Home Page!</h1>
      <p>You are signed in with user ID: {userId}</p>
      <p className="mt-4">Use the UserButton in the header to sign out.</p>
    </div>
  );
}