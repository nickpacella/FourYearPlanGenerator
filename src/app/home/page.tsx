"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const router = useRouter();

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-extrabold text-indigo-600 mb-8">Your Saved Schedules</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:bg-gray-100 transition"
            onClick={() => openSchedule(schedule.id)}
          >
            <h2 className="text-2xl font-bold text-indigo-500 mb-4">{schedule.name}</h2>
            <p className="text-gray-600">Major: {schedule.schedule.major}</p>
            <p className="text-gray-600">Minor: {schedule.schedule.minor}</p>
            <p className="text-gray-600">Electives: {schedule.schedule.electives.join(', ')}</p>
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
