// __tests__/components/NewSchedulePage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import NewSchedulePage from '../../src/app/schedule/new/page';
import { useSearchParams } from 'next/navigation';
import '@testing-library/jest-dom';

// Mocking Next.js router
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// Mock window.alert to avoid errors in Jest environment
window.alert = jest.fn();

// Setting up mock implementations
const mockScheduleId = '123';
const mockUseSearchParams = {
  get: jest.fn().mockReturnValue(mockScheduleId),
};

describe('NewSchedulePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchParams as jest.Mock).mockReturnValue(mockUseSearchParams);

    // Mock the fetch function for API interactions
    global.fetch = jest.fn().mockImplementation((url, options) => {
      if (url.includes('/api/getSchedule')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            schedule: {
              id: '123',
              name: 'Existing Schedule',
              schedule: {
                major: 'Computer Science',
                minor: 'Mathematics',
                electives: ['Art', 'History'],
              },
            },
          }),
        });
      } else if (url.includes('/api/saveSchedule') && options?.method === 'POST') {
        return Promise.resolve({ ok: true });
      } else if (url.includes('/api/getCourses')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ courses: [] }), // Mock courses data
        });
      } else if (url.includes('/api/getElectives')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ electives: [] }), // Mock electives data
        });
      } else {
        return Promise.reject(new Error('Unknown API endpoint'));
      }
    });
  });

  afterEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders the correct title for creating or updating a schedule', async () => {
    await act(async () => {
      render(<NewSchedulePage />);
    });
    expect(screen.getByText(/Update Schedule/i)).toBeInTheDocument();
  });

  it('fetches and displays existing schedule data', async () => {
    await act(async () => {
      render(<NewSchedulePage />);
    });

    // Ensure that the fetched data is rendered
    await waitFor(() => {
      expect(screen.getByDisplayValue(/Computer Science/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/Mathematics/i)).toBeInTheDocument();
      // For electives, adjust the selector as per your component's implementation
      expect(screen.getByText(/Art/i)).toBeInTheDocument();
    });
  });

  it('opens the name modal when Save Schedule button is clicked', async () => {
    await act(async () => {
      render(<NewSchedulePage />);
    });

    const saveButton = screen.getByText(/Save Schedule/i);
    fireEvent.click(saveButton);

    expect(screen.getByText(/Name Your Schedule/i)).toBeInTheDocument();
  });

  it('saves the schedule with a valid name and shows success message', async () => {
    await act(async () => {
      render(<NewSchedulePage />);
    });

    // Open the save modal
    const saveButton = screen.getByText(/Save Schedule/i);
    fireEvent.click(saveButton);

    // Enter a valid name and confirm saving
    const modal = screen.getByText(/Name Your Schedule/i).closest('div');
    if (modal) {
      const input = within(modal).getByPlaceholderText(/Enter schedule name/i);
      fireEvent.change(input, { target: { value: 'New Schedule Name' } });
      const saveInModalButton = within(modal).getByText(/Save/i);
      fireEvent.click(saveInModalButton);
    } else {
      throw new Error('Modal container not found');
    }

    // Check for the success message
    await waitFor(() => {
      expect(
        screen.getByText(/Schedule has been saved successfully/i)
      ).toBeInTheDocument();
    });
  });

  it('displays an error message if major field is empty when saving', async () => {
    await act(async () => {
      render(<NewSchedulePage />);
    });

    // Clear major field
    const majorSelect = screen.getByLabelText(/Select Major/i);
    fireEvent.change(majorSelect, { target: { value: '' } });

    // Attempt to save schedule
    const saveButton = screen.getByText(/Save Schedule/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Please ensure all fields are filled before saving.'
      );
    });
  });

  it('shows error message when fetching schedule data fails', async () => {
    // Mock the fetch call to fail by rejecting the promise
    (global.fetch as jest.Mock).mockImplementation((url) =>
      url.includes('/api/getSchedule')
        ? Promise.reject(new Error('Network error'))
        : url.includes('/api/getCourses')
        ? Promise.resolve({
            ok: true,
            json: async () => ({ courses: [] }),
          })
        : url.includes('/api/getElectives')
        ? Promise.resolve({
            ok: true,
            json: async () => ({ electives: [] }),
          })
        : Promise.reject(new Error('Unknown API endpoint'))
    );

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      render(<NewSchedulePage />);
    });

    // Check if the specific error message was logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching schedule:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
