import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import HomePage from '../../src/app/home/page';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
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

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        schedules: [
          {
            id: '1',
            name: 'Sample Schedule',
            schedule: {
              major: 'Computer Science',
              minor: 'Mathematics',
              electives: ['Art History', 'Philosophy'],
            },
          },
        ],
      }),
    }) as jest.Mock;
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

    await waitFor(() => expect(screen.getByText(/Sample Schedule/i)).toBeInTheDocument());

    const deleteButton = screen.getByText(/Delete Schedule/i);
    fireEvent.click(deleteButton);

    expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument();
  });

  it('calls router.push with selected schedule ID when edit button is clicked', async () => {
    await act(async () => {
      render(<HomePage />);
    });

    await waitFor(() => expect(screen.getByText(/Sample Schedule/i)).toBeInTheDocument());

    const editButton = screen.getByLabelText('Edit Schedule');
    fireEvent.click(editButton);

    expect(mockPush).toHaveBeenCalledWith('/schedule/new?id=1');
  });
});
