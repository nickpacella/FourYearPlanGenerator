"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';

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
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [name, setName] = useState<string>('User');
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      setName(fullName || 'User');
    }
  }, [user]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch('/api/getSchedules');
        const data = await response.json();
        setSchedules(data.schedules);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    fetchSchedules();
  }, []);

  const openSchedule = (scheduleId: string) => {
    router.push(`/schedule/new?id=${scheduleId}`);
  };

  const deleteSchedule = async (scheduleId: string) => {
    try {
      const response = await fetch(`/api/deleteSchedule`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: scheduleId }),
      });

      if (response.ok) {
        setSchedules((prevSchedules) =>
          prevSchedules.filter((schedule) => schedule.id !== scheduleId)
        );
        console.log('Schedule deleted successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to delete schedule:', errorData.message);
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-5xl font-extrabold text-indigo-600 mb-2 leading-relaxed">
        {isSignedIn ? `Welcome back, ${name}!` : 'Welcome!'}
      </h1>
      <p className="text-3xl text-gray-700 mb-8">View your saved plans</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="bg-white rounded-lg shadow-lg p-6 relative">
            <h2 className="text-2xl font-bold text-indigo-500 mb-4">
              {schedule.name}
            </h2>

            {/* Edit icon/button to navigate to the schedule page */}
            <button
              className="absolute top-6 right-6 text-indigo-500 hover:text-indigo-700"
              onClick={() => openSchedule(schedule.id)} // Reusing openSchedule logic
              aria-label="Edit Schedule"
            >
              <FontAwesomeIcon icon={faPencilAlt} size="lg" />
            </button>

            <p className="text-gray-600">Major: {schedule.schedule.major}</p>
            <p className="text-gray-600">Minor: {schedule.schedule.minor}</p>
            <p className="text-gray-600">
              Electives: {schedule.schedule.electives.join(', ')}
            </p>

            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this schedule?")) {
                  deleteSchedule(schedule.id);
                }
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition"
            >
              Delete Schedule
            </button>
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
