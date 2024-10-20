import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import Link from 'next/link'; // For navigation

async function getUserName(userId: string) {
  try {
    const user = await clerkClient.users.getUser(userId);
    return `${user.firstName} ${user.lastName}`;
  } catch (error) {
    console.error('Error fetching user:', error);
    return 'User'; // Fallback
  }
}

export default async function HomePage() {
  const { userId } = auth();
  const name = userId ? await getUserName(userId) : 'User';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-600 mb-2">
          Welcome back, {name}!
        </h1>
        <p className="text-gray-700 text-lg">
          You are signed in with user ID: {userId || 'N/A'}
        </p>
        <p className="mt-2 text-gray-500">
          Use the UserButton in the header to sign out.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-indigo-500 mb-4">Year 1 Schedule</h2>
          <p className="text-gray-600">This is a placeholder for the first-year schedule.</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-indigo-500 mb-4">Year 2 Schedule</h2>
          <p className="text-gray-600">This is a placeholder for the second-year schedule.</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-indigo-500 mb-4">Year 3 Schedule</h2>
          <p className="text-gray-600">This is a placeholder for the third-year schedule.</p>
        </div>
      </div>

      <Link href="/schedule/new">
        <button className="mt-6 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition">
          Create New Schedule
        </button>
      </Link>
    </div>
  );
}
