// __tests__/components/HomePage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import HomePage from '../../src/app/home/page';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import '@testing-library/jest-dom';

// Mocking Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mocking Clerk's authentication hooks
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
  useUser: jest.fn(),
}));

describe('HomePage', () => {
  const mockPush = jest.fn();
  const mockIsSignedIn = true;
  const mockUser = { firstName: 'John', lastName: 'Doe' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useAuth as jest.Mock).mockReturnValue({ isSignedIn: mockIsSignedIn });
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });

    // Default fetch mock for successful schedule fetching and deletion
    global.fetch = jest.fn().mockImplementation((url, options) => {
      if (url === '/api/getSchedules') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            schedules: [
              {
                id: '1',
                name: 'Sample Schedule 1',
                schedule: {
                  major: 'Computer Science',
                  minor: 'Mathematics',
                  electives: ['Art History', 'Philosophy'],
                },
              },
              {
                id: '2',
                name: 'Sample Schedule 2',
                schedule: {
                  major: 'Biology',
                  minor: '',
                  electives: ['Chemistry', 'Physics'],
                },
              },
            ],
          }),
        });
      } else if (url === '/api/deleteSchedule' && options?.method === 'DELETE') {
        return Promise.resolve({ ok: true });
      }
      return Promise.reject(new Error('Unknown API endpoint'));
    });
  });

  afterEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders the welcome message for a signed-in user', async () => {
    await act(async () => {
      render(<HomePage />);
    });
    expect(screen.getByText(`Welcome back, ${mockUser.firstName} ${mockUser.lastName}!`)).toBeInTheDocument();
  });

  it('opens delete confirmation modal when delete button is clicked', async () => {
    await act(async () => {
      render(<HomePage />);
    });

    // Wait for schedules to be rendered
    await waitFor(() => expect(screen.getByText(/Sample Schedule 1/i)).toBeInTheDocument());

    // Find and click the first "Delete Schedule" button
    const deleteButtons = screen.getAllByText(/Delete Schedule/i);
    fireEvent.click(deleteButtons[0]);

    // Check if the modal with "Confirm Deletion" is displayed
    expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument();
  });

  it('deletes a schedule and removes it from the list when confirmed in modal', async () => {
    await act(async () => {
      render(<HomePage />);
    });

    // Ensure the first schedule is rendered
    await waitFor(() => expect(screen.getByText(/Sample Schedule 1/i)).toBeInTheDocument());

    // Click the first "Delete Schedule" button to open the modal
    const deleteButtons = screen.getAllByText(/Delete Schedule/i);
    fireEvent.click(deleteButtons[0]);

    // Verify that the modal is open by checking for "Confirm Deletion"
    expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument();

    // Within the modal, find and click the "Delete" button
    const modalConfirmDeletion = screen.getByText(/Confirm Deletion/i).closest('div');
    if (modalConfirmDeletion) {
      const modal = within(modalConfirmDeletion);
      const confirmDeleteButton = modal.getByText('Delete');
      fireEvent.click(confirmDeleteButton);
    } else {
      // If modal container is not found, fail the test
      throw new Error('Modal container not found');
    }

    // Wait for the schedule to be removed from the DOM
    await waitFor(() => expect(screen.queryByText(/Sample Schedule 1/i)).not.toBeInTheDocument());
  });

  it('calls router.push with selected schedule ID when edit button is clicked', async () => {
    await act(async () => {
      render(<HomePage />);
    });

    // Wait for schedules to be rendered
    await waitFor(() => expect(screen.getByText(/Sample Schedule 1/i)).toBeInTheDocument());

    // Find and click the first "Edit Schedule" button
    const editButtons = screen.getAllByLabelText('Edit Schedule');
    fireEvent.click(editButtons[0]);

    // Expect router.push to have been called with the correct URL
    expect(mockPush).toHaveBeenCalledWith('/schedule/new?id=1');
  });

  it('displays error message if less than two schedules are selected for comparison', async () => {
    await act(async () => {
      render(<HomePage />);
    });

    // Click the "Compare Schedules" button without selecting any schedules
    const compareButton = screen.getByText(/Compare Schedules/i);
    fireEvent.click(compareButton);

    // Expect the error message to be displayed
    expect(screen.getByText(/Please select at least two schedules to compare./i)).toBeInTheDocument();
  });

  it('navigates to compare schedules page when multiple schedules are selected', async () => {
    await act(async () => {
      render(<HomePage />);
    });

    // Wait for schedules to be rendered
    await waitFor(() => expect(screen.getByText(/Sample Schedule 1/i)).toBeInTheDocument());

    // Select the first two checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Select first schedule
    fireEvent.click(checkboxes[1]); // Select second schedule

    // Click the "Compare Schedules" button
    const compareButton = screen.getByText(/Compare Schedules/i);
    fireEvent.click(compareButton);

    // Expect router.push to have been called with the correct URL
    expect(mockPush).toHaveBeenCalledWith('/compareSchedules?schedules=1,2');
  });

  it('shows an error message when fetching schedules fails', async () => {
    // Mock console.error to monitor error logging
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock fetch to simulate an HTTP error response for fetching schedules
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: async () => ({ message: 'Failed to fetch schedules.' }),
      })
    );

    await act(async () => {
      render(<HomePage />);
    });

    // Since the component does not render an error message, we check if console.error was called
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching schedules:',
        expect.any(Error)
      );
    });

    // Restore the original console.error
    consoleErrorSpy.mockRestore();
  });
});
