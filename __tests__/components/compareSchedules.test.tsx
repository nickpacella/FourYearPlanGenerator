// __tests__/components/compareSchedules.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CompareSchedulesPage from '../../src/app/compareSchedules/page';
import { useSearchParams } from 'next/navigation';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import { createMockRouter } from '../../src/utils/createMockRouter';

// Mock useSearchParams from next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

describe('CompareSchedulesPage', () => {
  const mockedUseSearchParams = useSearchParams as jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    // Mock the global fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockSchedules = {
    schedules: [
      {
        id: '1',
        name: 'Schedule One',
        schedule: {
          major: 'Computer Science',
          minor: 'Mathematics',
          electives: ['Art', 'History'],
        },
      },
      {
        id: '2',
        name: 'Schedule Two',
        schedule: {
          major: 'Biology',
          minor: '',
          electives: [],
        },
      },
    ],
  };

  const mockPlans = {
    plan: [
      ['CS101', 'MATH101'],
      ['CS102', 'MATH102'],
      ['CS103', 'HIST201'],
    ],
  };

  const renderComponent = () => {
    const mockRouter = createMockRouter({});
    return render(
      <RouterContext.Provider value={mockRouter}>
        <CompareSchedulesPage />
      </RouterContext.Provider>
    );
  };

  test('displays loading state initially', () => {
    // Mock search params
    mockedUseSearchParams.mockReturnValue({
      get: () => '1,2',
    });

    // Mock fetch to never resolve to keep loading state
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    renderComponent();

    expect(screen.getByText(/Loading comparison.../i)).toBeInTheDocument();
  });

  test('displays error when no schedules are selected', async () => {
    mockedUseSearchParams.mockReturnValue({
      get: () => null,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/No schedules selected for comparison./i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go Back Home/i })).toBeInTheDocument();
    });
  });

  test('handles schedules not found', async () => {
    mockedUseSearchParams.mockReturnValue({
      get: () => '1,3', // '3' does not exist
    });

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/getSchedules')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSchedules),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Some selected schedules could not be found./i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go Back Home/i })).toBeInTheDocument();
    });
  });

  test('handles fetch failure when generating plans', async () => {
    mockedUseSearchParams.mockReturnValue({
      get: () => '1,2',
    });

    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/getSchedules')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSchedules),
        });
      }

      if (url.includes('/api/generate-plan')) {
        if (options && options.body) {
          const body = JSON.parse(options.body);
          if (body.major === 'Biology') {
            return Promise.resolve({
              ok: false,
              status: 400,
              json: () => Promise.resolve({ error: 'Plan generation failed.' }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPlans),
          });
        }
      }

      return Promise.reject(new Error('Unknown endpoint'));
    });

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to generate plan for Schedule Two: Plan generation failed./i)
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go Back Home/i })).toBeInTheDocument();
    });
  });

  test('renders schedules and plans correctly', async () => {
    mockedUseSearchParams.mockReturnValue({
      get: () => '1,2',
    });

    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/getSchedules')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSchedules),
        });
      }

      if (url.includes('/api/generate-plan')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPlans),
        });
      }

      return Promise.reject(new Error('Unknown endpoint'));
    });

    renderComponent();

    // Wait for the main heading to appear
    await waitFor(() => {
      expect(screen.getByText(/Compare Schedules/i)).toBeInTheDocument();
    });

    // Check schedule names
    expect(screen.getByText('Schedule One')).toBeInTheDocument();
    expect(screen.getByText('Schedule Two')).toBeInTheDocument();

    // Check majors
    expect(screen.getByText(/Major: Computer Science/i)).toBeInTheDocument();
    expect(screen.getByText(/Major: Biology/i)).toBeInTheDocument();

    // Check minors
    expect(screen.getByText(/Minor: Mathematics/i)).toBeInTheDocument();
    expect(screen.getByText(/Minor: None/i)).toBeInTheDocument();

    // Check electives
    expect(screen.getByText(/Electives: Art, History/i)).toBeInTheDocument();
    expect(screen.getByText(/Electives: None/i)).toBeInTheDocument();

    // Check plans
    const semesterHeaders = screen.getAllByText(/Semester \d+/i);
    expect(semesterHeaders.length).toBeGreaterThan(0);

    // Check courses
    expect(screen.getAllByText('CS101')[0]).toBeInTheDocument();
    expect(screen.getAllByText('MATH101')[0]).toBeInTheDocument();
    expect(screen.getAllByText('CS102')[0]).toBeInTheDocument();
    expect(screen.getAllByText('MATH102')[0]).toBeInTheDocument();
    expect(screen.getAllByText('CS103')[0]).toBeInTheDocument();
    expect(screen.getAllByText('HIST201')[0]).toBeInTheDocument();

    // Check Back to Home button
    expect(screen.getByRole('button', { name: /Back to Home/i })).toBeInTheDocument();
  });

  test('renders "No plan available" when plans are empty', async () => {
    mockedUseSearchParams.mockReturnValue({
      get: () => '1',
    });

    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/getSchedules')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ schedules: [mockSchedules.schedules[0]] }),
        });
      }

      if (url.includes('/api/generate-plan')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ plan: [] }), // Empty plan
        });
      }

      return Promise.reject(new Error('Unknown endpoint'));
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/No plan available./i)).toBeInTheDocument();
    });
  });

  test('navigates back to home when "Go Back Home" button is clicked', async () => {
    mockedUseSearchParams.mockReturnValue({
      get: () => null,
    });

    const mockRouter = createMockRouter({});
    render(
      <RouterContext.Provider value={mockRouter}>
        <CompareSchedulesPage />
      </RouterContext.Provider>
    );

    const button = await screen.findByRole('button', { name: /Go Back Home/i });
    expect(button).toBeInTheDocument();

    userEvent.click(button);

    // Since the component uses <Link>, we check if the link has the correct href
    const link = button.closest('a');
    expect(link).toHaveAttribute('href', '/home');
  });

  test('navigates back to home when "Back to Home" button is clicked', async () => {
    mockedUseSearchParams.mockReturnValue({
      get: () => '1,2',
    });

    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/getSchedules')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSchedules),
        });
      }

      if (url.includes('/api/generate-plan')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPlans),
        });
      }

      return Promise.reject(new Error('Unknown endpoint'));
    });

    const mockRouter = createMockRouter({});
    render(
      <RouterContext.Provider value={mockRouter}>
        <CompareSchedulesPage />
      </RouterContext.Provider>
    );

    // Wait for schedules to be rendered
    await waitFor(() => {
      expect(screen.getByText(/Compare Schedules/i)).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /Back to Home/i });
    expect(button).toBeInTheDocument();

    userEvent.click(button);

    const link = button.closest('a');
    expect(link).toHaveAttribute('href', '/home');
  });
});
