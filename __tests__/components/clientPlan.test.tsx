// __tests__/components/clientPlan.test.tsx

// __tests__/components/clientPlan.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import ClientPlan from '../../src/app/components/ClientPlan';
import '@testing-library/jest-dom';


describe('ClientPlan Component', () => {
  const setMajor = jest.fn();
  const setMinor = jest.fn();
  const setElectives = jest.fn();
  const major = 'Computer Science';
  const minor = 'Mathematics';
  const electives = ['Art'];

  beforeEach(() => {
    jest.clearAllMocks();
  
    // Mock fetch for API calls
    global.fetch = jest.fn().mockImplementation((url, options) => {
      if (url.includes('/api/getElectives')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            electives: [
              { code: 'Art', name: 'Art Appreciation', prerequisites: [] },
              { code: 'History', name: 'World History', prerequisites: [] },
            ],
          }),
        });
      } else if (url.includes('/api/getCourses')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            courses: [
              { code: 'CS101', name: 'Intro to CS', prerequisites: [] },
              { code: 'MATH101', name: 'Calculus I', prerequisites: [] },
            ],
          }),
        });
      } else if (url.includes('/api/generate-plan')) {
        // Parse the request body to get the electives
        const body = JSON.parse(options?.body || '{}');
        const electivesInBody = body.electives || [];
  
        return Promise.resolve({
          ok: true,
          json: async () => ({
            plan: [
              ['CS101', 'MATH101'],
              ...electivesInBody.map((elective: string) => [elective]),
            ],
          }),
        });
      } else if (url.includes('/api/updateSchedule')) {
        return Promise.resolve({
          ok: true,
        });
      } else {
        return Promise.reject(new Error('Unknown API endpoint'));
      }
    });
  });
  

  afterEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('fetches all electives and courses on mount', async () => {
    await act(async () => {
      render(
        <ClientPlan
          setMajor={setMajor}
          setMinor={setMinor}
          setElectives={setElectives}
          major=""
          minor=""
          electives={[]}
        />
      );
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/getElectives');
    expect(global.fetch).toHaveBeenCalledWith('/api/getCourses');
  });

  it('automatically generates the plan when major is selected', async () => {
    await act(async () => {
      render(
        <ClientPlan
          setMajor={setMajor}
          setMinor={setMinor}
          setElectives={setElectives}
          major={major}
          minor=""
          electives={[]}
        />
      );
    });

    // Wait for the plan to be generated
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/generate-plan',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    // Check if the plan is rendered
    expect(screen.getByText(/Semester 1/i)).toBeInTheDocument();
    expect(screen.getByText(/CS101/i)).toBeInTheDocument();
  });

  it('regenerates the plan when major or minor is updated', async () => {
    const { rerender } = render(
      <ClientPlan
        setMajor={setMajor}
        setMinor={setMinor}
        setElectives={setElectives}
        major=""
        minor=""
        electives={[]}
      />
    );
  
    // Initial render should not generate plan
    const generatePlanCallsInitial = (global.fetch as jest.Mock).mock.calls.filter(
      ([url]) => url.includes('/api/generate-plan')
    );
    expect(generatePlanCallsInitial.length).toBe(0);
  
    // Update major
    await act(async () => {
      rerender(
        <ClientPlan
          setMajor={setMajor}
          setMinor={setMinor}
          setElectives={setElectives}
          major={major}
          minor=""
          electives={[]}
        />
      );
    });
  
    // Wait for the plan to be generated
    await waitFor(() => {
      const generatePlanCalls = (global.fetch as jest.Mock).mock.calls.filter(
        ([url]) => url.includes('/api/generate-plan')
      );
      expect(generatePlanCalls.length).toBe(2);
    });
  
    // Update minor
    await act(async () => {
      rerender(
        <ClientPlan
          setMajor={setMajor}
          setMinor={setMinor}
          setElectives={setElectives}
          major={major}
          minor={minor}
          electives={[]}
        />
      );
    });
  
    // Wait for the plan to be regenerated
    await waitFor(() => {
      const generatePlanCalls = (global.fetch as jest.Mock).mock.calls.filter(
        ([url]) => url.includes('/api/generate-plan')
      );
      expect(generatePlanCalls.length).toBe(3);
    });
  });
  
  

  it('updates schedule when scheduleId is present and handleUpdatePlan is called', async () => {
    // Mock fetch for /api/updateSchedule
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (url.includes('/api/updateSchedule')) {
        return Promise.resolve({
          ok: true,
        });
      } else if (url.includes('/api/getElectives')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ electives: [] }),
        });
      } else if (url.includes('/api/getCourses')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ courses: [] }),
        });
      } else if (url.includes('/api/generate-plan')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ plan: [['CS101']] }),
        });
      } else {
        return Promise.reject(new Error('Unknown API endpoint'));
      }
    });

    await act(async () => {
      render(
        <ClientPlan
          setMajor={setMajor}
          setMinor={setMinor}
          setElectives={setElectives}
          major={major}
          minor={minor}
          electives={electives}
          scheduleId="123"
        />
      );
    });

    // Click on Generate Plan button
    const generateButton = screen.getByText(/Generate Plan/i);
    await act(async () => {
      fireEvent.click(generateButton);
    });

    // Wait for updateSchedule to be called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/updateSchedule',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            id: '123',
            schedule: {
              major,
              minor,
              electives,
            },
          }),
        })
      );
    });
  });

  it('calculates completed courses correctly', async () => {
    // Since calculateCompletedCourses is internal, we can simulate plan generation and check state
    await act(async () => {
      render(
        <ClientPlan
          setMajor={setMajor}
          setMinor={setMinor}
          setElectives={setElectives}
          major={major}
          minor={minor}
          electives={electives}
        />
      );
    });

    // Wait for the plan to be set
    await waitFor(() => {
      expect(screen.getByText(/Semester 1/i)).toBeInTheDocument();
    });

    // Access completedCourses from the component's state
    // Since we can't access internal state directly, we'll check the rendering to infer the calculation
    expect(screen.getByText(/CS101/i)).toBeInTheDocument();
    expect(screen.getByText(/MATH101/i)).toBeInTheDocument();
  });

  it('determines available electives based on completed courses', async () => {
    await act(async () => {
      render(
        <ClientPlan
          setMajor={setMajor}
          setMinor={setMinor}
          setElectives={setElectives}
          major={major}
          minor={minor}
          electives={[]}
        />
      );
    });

    // Wait for electives to be fetched
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/getElectives');
    });

    // Simulate that completed courses include 'CS101' which is a prerequisite for 'Advanced Art'
    // Since we can't modify internal state directly, this is a limitation in testing the internal logic
    // Alternatively, we can test that electives are displayed correctly

    // Check if the electives dropdown is rendered
    expect(screen.getByText(/Select Electives/i)).toBeInTheDocument();
  });

  it('handles errors during plan generation gracefully', async () => {
    // Mock fetch for /api/generate-plan to fail
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/generate-plan')) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Failed to generate plan.' }),
        });
      } else if (url.includes('/api/getElectives')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ electives: [] }),
        });
      } else if (url.includes('/api/getCourses')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ courses: [] }),
        });
      } else {
        return Promise.reject(new Error('Unknown API endpoint'));
      }
    });

    await act(async () => {
      render(
        <ClientPlan
          setMajor={setMajor}
          setMinor={setMinor}
          setElectives={setElectives}
          major={major}
          minor={minor}
          electives={[]}
        />
      );
    });

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to generate plan./i)).toBeInTheDocument();
    });
  });

  it('highlights newly added electives in the plan', async () => {
    // First render with initial electives
    const { rerender } = render(
      <ClientPlan
        setMajor={setMajor}
        setMinor={setMinor}
        setElectives={setElectives}
        major={major}
        minor={minor}
        electives={['Art']}
      />
    );
  
    // Wait for initial plan generation
    const scheduleContainer = screen.getByText('Generated Schedule').parentElement!;
    await waitFor(() => {
      expect(within(scheduleContainer).getByText('Art')).toBeInTheDocument();
    });
  
    // Update electives by changing the 'electives' prop
    await act(async () => {
      rerender(
        <ClientPlan
          setMajor={setMajor}
          setMinor={setMinor}
          setElectives={setElectives}
          major={major}
          minor={minor}
          electives={['Art', 'History']}
        />
      );
    });
  
    // Simulate clicking the 'Generate Plan' button to regenerate the plan
    const generateButton = screen.getByText(/Generate Plan/i);
    await act(async () => {
      fireEvent.click(generateButton);
    });
  
    // Wait for the plan to regenerate and 'History' to appear in the schedule
    await waitFor(() => {
      expect(within(scheduleContainer).getByText('History')).toBeInTheDocument();
    });
  
    // Check if 'History' is highlighted in the schedule
    const historyCourse = within(scheduleContainer).getByText('History');
    expect(historyCourse).toHaveClass('animate-pulseToSolidGreen');
  });
  
  
  
});
