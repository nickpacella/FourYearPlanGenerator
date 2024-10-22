"use client";

// Import necessary modules and hooks from React, Next.js, and Clerk
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';

/**
 * Type definition for a Schedule object.
 * Ensures consistency in the structure of schedule data.
 */
type Schedule = {
  id: string;
  name: string;
  schedule: {
    major: string;
    minor: string;
    electives: string[];
  };
};

/**
 * HomePage Component
 * 
 * This component serves as the main dashboard where users can view,
 * create, and manage their schedules. It handles fetching schedules
 * from an API, displaying them, and providing functionalities to
 * navigate to detailed views or delete schedules.
 */
export default function HomePage() {
  // State to hold the list of schedules
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  
  // State to hold the user's full name, defaults to 'User' if not available
  const [name, setName] = useState<string>('User');
  
  // Next.js router for client-side navigation
  const router = useRouter();
  
  // Authentication hooks from Clerk
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  /**
   * Effect to update the user's name when the user object changes.
   * Constructs the full name from firstName and lastName provided by Clerk.
   */
  useEffect(() => {
    if (user) {
      // Combine firstName and lastName, trim any extra spaces
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      
      // Update the name state; default to 'User' if fullName is empty
      setName(fullName || 'User');
    }
  }, [user]);

  /**
   * Effect to fetch schedules from the backend API when the component mounts.
   * It updates the schedules state with the fetched data.
   * Handles and logs any errors that occur during the fetch.
   */
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        // Make a GET request to the /api/getSchedules endpoint
        const response = await fetch('/api/getSchedules');
        
        // Parse the JSON response
        const data = await response.json();
        
        // Update the schedules state with the fetched data
        setSchedules(data.schedules);
      } catch (error) {
        // Log any errors that occur during the fetch
        console.error('Error fetching schedules:', error);
      }
    };

    // Initiate the fetch operation
    fetchSchedules();
  }, []);

  /**
   * Function to navigate to the detailed view of a specific schedule.
   * 
   * @param scheduleId - The ID of the schedule to view
   */
  const openSchedule = (scheduleId: string) => {
    // Navigate to the schedule detail page with the schedule ID as a query parameter
    router.push(`/schedule/new?id=${scheduleId}`);
  };

  /**
   * Function to delete a specific schedule.
   * Sends a DELETE request to the backend API and updates the UI upon success.
   * 
   * @param scheduleId - The ID of the schedule to delete
   */
  const deleteSchedule = async (scheduleId: string) => {
    try {
      // Make a DELETE request to the /api/deleteSchedule endpoint with the schedule ID
      const response = await fetch(`/api/deleteSchedule`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: scheduleId }),
      });

      if (response.ok) {
        // If deletion is successful, update the schedules state to remove the deleted schedule
        setSchedules((prevSchedules) =>
          prevSchedules.filter((schedule) => schedule.id !== scheduleId)
        );
        console.log('Schedule deleted successfully');
      } else {
        // If the response is not OK, parse and log the error message
        const errorData = await response.json();
        console.error('Failed to delete schedule:', errorData.message);
      }
    } catch (error) {
      // Log any errors that occur during the deletion process
      console.error('Error deleting schedule:', error);
    }
  };

  return (
    // Main container with Tailwind CSS classes for styling and layout
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      
      {/* Welcome message */}
      <h1 className="text-5xl font-extrabold text-indigo-600 mb-2 leading-relaxed">
        {isSignedIn ? `Welcome back, ${name}!` : 'Welcome!'}
      </h1>
      
      {/* Subtitle */}
      <p className="text-3xl text-gray-700 mb-8">View your saved plans</p>

      {/* Grid container for displaying schedules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {schedules.map((schedule) => (
          // Individual schedule card
          <div key={schedule.id} className="bg-white rounded-lg shadow-lg p-6">
            
            {/* Schedule title: Clickable to navigate to schedule details */}
            <h2
              className="text-2xl font-bold text-indigo-500 mb-4 cursor-pointer"
              onClick={() => openSchedule(schedule.id)} // Open schedule on click
            >
              {schedule.name}
            </h2>
            
            {/* Schedule details */}
            <p className="text-gray-600">Major: {schedule.schedule.major}</p>
            <p className="text-gray-600">Minor: {schedule.schedule.minor}</p>
            <p className="text-gray-600">
              Electives: {schedule.schedule.electives.join(', ')}
            </p>
            
            {/* Delete button for removing the schedule */}
            <button
              onClick={() => deleteSchedule(schedule.id)}
              className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition"
            >
              Delete Schedule
            </button>
          </div>
        ))}
      </div>

      {/* Button to navigate to the create new schedule page */}
      <Link href="/schedule/new">
        <button className="mt-6 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition">
          Create New Schedule
        </button>
      </Link>
    </div>
  );
}
