"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import the router for navigation
import Link from 'next/link'; // Make sure Link is imported

type Schedule = {
  id: string;
  name: string;
  schedule: {
    major: string;
    minor: string;
    electives: string[];
  };
};

export default function HomePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]); // Explicitly typing the schedules array
  const router = useRouter(); // Use Next.js router for navigation

  useEffect(() => {
    const fetchSchedules = async () => {
      const response = await fetch('/api/getSchedules'); // API to fetch schedules
      const data = await response.json();
      setSchedules(data.schedules);
    };

    fetchSchedules();
  }, []);

  // Function to handle navigation when a schedule is clicked
  const openSchedule = (scheduleId: string) => {
    router.push(`/schedule/new?id=${scheduleId}`); // Use template literal for navigation
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-extrabold text-indigo-600 mb-8">Your Saved Schedules</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:bg-gray-100 transition"
            onClick={() => openSchedule(schedule.id)} // Call function to open the schedule
          >
            <h2 className="text-2xl font-bold text-indigo-500 mb-4">ID: {schedule.id}</h2>
            <p className="text-gray-600">Schedule Name: {schedule.name}</p>
          </div>
        ))}
      </div>

      <Link href="/schedule/new">
        <button className="mt-6 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition">
          Create New Schedule
        </button>
      </Link>
    </div>
  );
}
