'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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

type Plan = string[][];

export default function CompareSchedulesPage() {
  const searchParams = useSearchParams();
  const [scheduleIds, setScheduleIds] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const schedulesParam = searchParams.get('schedules');
    if (schedulesParam) {
      const ids = schedulesParam.split(',').map((id) => id.trim()).filter((id) => id.length > 0);
      setScheduleIds(ids);
    } else {
      setError('No schedules selected for comparison.');
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (scheduleIds.length === 0) return;

    const fetchSchedules = async () => {
      try {
        const response = await fetch('/api/getSchedules');
        if (!response.ok) {
          throw new Error('Failed to fetch schedules.');
        }
        const data = await response.json();
        const selectedSchedules: Schedule[] = data.schedules.filter((sched: Schedule) =>
          scheduleIds.includes(sched.id)
        );

        if (selectedSchedules.length !== scheduleIds.length) {
          throw new Error('Some selected schedules could not be found.');
        }

        setSchedules(selectedSchedules);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred while fetching schedules.');
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [scheduleIds]);

  useEffect(() => {
    if (schedules.length === 0) return;

    const generateAllPlans = async () => {
      try {
        const generatedPlans: Plan[] = [];

        for (const schedule of schedules) {
          const response = await fetch('/api/make-plan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              major: schedule.schedule.major,
              minor: schedule.schedule.minor,
              electives: schedule.schedule.electives,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to generate plan for ${schedule.name}: ${errorData.error}`);
          }

          const data = await response.json();
          generatedPlans.push(data.plan);
        }

        setPlans(generatedPlans);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred while generating plans.');
      } finally {
        setLoading(false);
      }
    };

    generateAllPlans();
  }, [schedules]);

  const classifyCourse = (course: string, semesterIdx: number, currentPlanIdx: number): 'yellow' | 'red' | 'none' => {
    const currentPlan = plans[currentPlanIdx];

    const existsInOtherSemester = plans.some((plan, planIdx) => {
      if (planIdx === currentPlanIdx) return false;
      return plan.some((semester, idx) => semester.includes(course) && idx !== semesterIdx);
    });

    const notInOtherSchedules = plans.every((plan, planIdx) => {
      if (planIdx === currentPlanIdx) return true;
      return plan.every((semester) => !semester.includes(course));
    });

    if (existsInOtherSemester) {
      return 'yellow';
    }

    if (notInOtherSchedules) {
      return 'red';
    }

    return 'none';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading comparison...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <p className="text-xl text-red-600 mb-4">{error}</p>
        <Link href="/home">
          <button className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition">
            Go Back Home
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-center text-indigo-600 mb-8">
        Compare Schedules
      </h1>

      <div className="flex flex-wrap justify-center gap-8">
        {schedules.map((schedule, index) => (
          <div key={schedule.id} className="bg-white rounded-lg shadow-lg p-6 w-full md:w-1/2 lg:w-1/3">
            <h2 className="text-2xl font-semibold text-indigo-500 mb-4">{schedule.name}</h2>
            <p className="text-gray-700">Major: {schedule.schedule.major}</p>
            <p className="text-gray-700">Minor: {schedule.schedule.minor || 'None'}</p>
            <p className="text-gray-700 mb-4">
              Electives: {schedule.schedule.electives.length > 0 ? schedule.schedule.electives.join(', ') : 'None'}
            </p>

            <h3 className="text-xl font-semibold text-indigo-400 mb-2">Academic Plan:</h3>
            {plans[index] && plans[index].length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, semesterIdx) => (
                <div
                  key={semesterIdx}
                  className="border bg-gray-100 p-2 text-center"
                  style={{ minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}
                >
                  <strong>Sem {semesterIdx + 1}</strong>
                  {plans[index]?.[semesterIdx]?.length > 0 ? (
                    <ul className="list-none mt-2">
                      {plans[index][semesterIdx].map((course) => {
                        const classification = classifyCourse(course, semesterIdx, index);
                        let className = '';
                        if (classification === 'yellow') {
                          className = 'bg-yellow-200';
                        } else if (classification === 'red') {
                          className = 'bg-red-200';
                        }
                        return (
                          <li key={course} className={className}>
                            {course}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <span className="text-gray-500 mt-2">No courses</span>
                  )}
                </div>
              ))}
            </div>
            
            ) : (
              <p className="text-gray-500">No plan available.</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Link href="/home">
          <button className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
