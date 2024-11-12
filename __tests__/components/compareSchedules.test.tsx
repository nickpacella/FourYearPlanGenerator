// __tests__/components/compareSchedules.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CompareSchedulesPage from '../../src/app/compareSchedules/page';
import { useSearchParams } from 'next/navigation';
import '@testing-library/jest-dom';

// Mock the useSearchParams hook from next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// Mock the Link component from next/link to render children directly
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

describe('CompareSchedulesPage', () => {
  // Define mock data for schedules and plans
  const mockSchedules = [
    {
      id: '1',
      name: 'Schedule One',
      schedule: {
        major: 'Computer Science',
        minor: 'Mathematics',
        electives: ['Art History', 'Philosophy'],
      },
    },
    {
      id: '2',
      name: 'Schedule Two',
      schedule: {
        major: 'Biology',
        minor: '',
        electives: ['Chemistry', 'Physics'],
      },
    },
  ];

  const mockPlan1 = [
    ['CS101', 'MATH101', 'ART101'],
    ['CS102', 'MATH102', 'PHIL101'],
  ];

  const mockPlan2 = [
    ['BIO101', 'CHEM101', 'PHY101'],
    ['BIO102', 'CHEM102', 'PHY102'],
  ];

  beforeEach(() => {
    // Default mock implementation: schedules=1,2
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => {
        if (key === 'schedules') return '1,2';
        return null;
      },
    });

    // Mock the global fetch function
    global.fetch = jest.fn().mockImplementation((url, options) => {
      // Handle fetching schedules
      if (url === '/api/getSchedules') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ schedules: mockSchedules }),
        });
      }

      // Handle generating academic plans
      if (url === '/api/generate-plan' && options?.method === 'POST') {
        const body = JSON.parse(options.body as string);
        if (body.major === 'Computer Science') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ plan: mockPlan1 }),
          });
        }
        if (body.major === 'Biology') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ plan: mockPlan2 }),
          });
        }
        // Simulate failure for unknown majors
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Failed to generate plan.' }),
        });
      }

      // Reject unknown endpoints
      return Promise.reject(new Error('Unknown API endpoint'));
    });
  });

  afterEach(() => {
    // Clear all mocks after each test
    (global.fetch as jest.Mock).mockClear();
    jest.resetAllMocks();
  });

  it('renders loading state initially', () => {
    render(<CompareSchedulesPage />);

    // Expect the loading message to be in the document
    expect(screen.getByText(/Loading comparison.../i)).toBeInTheDocument();
  });

  it('renders schedules and their plans correctly', async () => {
    render(<CompareSchedulesPage />);

    // Wait for schedules to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('Schedule One')).toBeInTheDocument();
      expect(screen.getByText('Schedule Two')).toBeInTheDocument();
    });

    // Wait for academic plans to be generated and displayed
    await waitFor(() => {
      // Check for specific course codes to ensure plans are rendered
      expect(screen.getByText('CS101')).toBeInTheDocument();
      expect(screen.getByText('CS102')).toBeInTheDocument();
      expect(screen.getByText('MATH101')).toBeInTheDocument();
      expect(screen.getByText('MATH102')).toBeInTheDocument();
      expect(screen.getByText('ART101')).toBeInTheDocument();
      expect(screen.getByText('PHIL101')).toBeInTheDocument();

      expect(screen.getByText('BIO101')).toBeInTheDocument();
      expect(screen.getByText('BIO102')).toBeInTheDocument();
      expect(screen.getByText('CHEM101')).toBeInTheDocument();
      expect(screen.getByText('CHEM102')).toBeInTheDocument();
      expect(screen.getByText('PHY101')).toBeInTheDocument();
      expect(screen.getByText('PHY102')).toBeInTheDocument();
    });
  });

  it('shows error message when no schedules are selected', async () => {
    // Mock useSearchParams to return no schedules
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => {
        if (key === 'schedules') return null;
        return null;
      },
    });

    render(<CompareSchedulesPage />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/No schedules selected for comparison./i)).toBeInTheDocument();
    });

    // Check that the "Go Back Home" button is present
    expect(screen.getByText(/Go Back Home/i)).toBeInTheDocument();

    // Verify that the button links to '/home'
    const backButton = screen.getByText(/Go Back Home/i).closest('a');
    expect(backButton).toHaveAttribute('href', '/home');
  });

  it('shows error message when some schedules are not found', async () => {
    // Modify fetch to return only one schedule instead of two
    (global.fetch as jest.Mock).mockImplementationOnce((url, options) => {
      if (url === '/api/getSchedules') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ schedules: [mockSchedules[0]] }), // Only the first schedule returned
        });
      }

      // Handle generating academic plans for the remaining schedules
      if (url === '/api/generate-plan' && options?.method === 'POST') {
        const body = JSON.parse(options.body as string);
        if (body.major === 'Computer Science') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ plan: mockPlan1 }),
          });
        }
        if (body.major === 'Biology') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ plan: mockPlan2 }),
          });
        }
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Failed to generate plan.' }),
        });
      }

      // Reject unknown endpoints
      return Promise.reject(new Error('Unknown API endpoint'));
    });

    render(<CompareSchedulesPage />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Some selected schedules could not be found./i)).toBeInTheDocument();
    });
  });

  it('shows error message when generating a plan fails', async () => {
    // Mock fetch to fail generating plan for one of the schedules
    (global.fetch as jest.Mock).mockImplementationOnce((url, options) => {
      if (url === '/api/getSchedules') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ schedules: mockSchedules }),
        });
      }

      if (url === '/api/generate-plan' && options?.method === 'POST') {
        const body = JSON.parse(options.body as string);
        if (body.major === 'Computer Science') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ plan: mockPlan1 }),
          });
        }
        if (body.major === 'Biology') {
          return Promise.resolve({
            ok: false,
            json: async () => ({ error: 'Failed to generate plan.' }),
          });
        }
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Failed to generate plan.' }),
        });
      }

      // Reject unknown endpoints
      return Promise.reject(new Error('Unknown API endpoint'));
    });

    render(<CompareSchedulesPage />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to generate plan./i)).toBeInTheDocument();
    });
  });

  it('displays error message when fetching schedules fails', async () => {
    // Mock fetch to fail fetching schedules
    (global.fetch as jest.Mock).mockImplementationOnce((url, options) => {
      if (url === '/api/getSchedules') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ message: 'Failed to fetch schedules.' }),
        });
      }

      // Reject unknown endpoints
      return Promise.reject(new Error('Unknown API endpoint'));
    });

    render(<CompareSchedulesPage />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch schedules./i)).toBeInTheDocument();
    });
  });

  it('has a "Back to Home" button that navigates to home', async () => {
    render(<CompareSchedulesPage />);

    // Wait for the "Back to Home" button to appear
    await waitFor(() => {
      expect(screen.getByText(/Back to Home/i)).toBeInTheDocument();
    });

    // Verify that the button links to '/home'
    const backButton = screen.getByText(/Back to Home/i).closest('a');
    expect(backButton).toHaveAttribute('href', '/home');
  });
});
