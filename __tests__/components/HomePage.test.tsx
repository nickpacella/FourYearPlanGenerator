import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '../../src/app/home/page';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import '@testing-library/jest-dom';

// Mock useRouter, useAuth, and useUser hooks
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

    // Mock router behavior
    const mockedUseRouter = useRouter as jest.Mock;
    mockedUseRouter.mockReturnValue({ push: mockPush });

    // Mock authentication behavior
    (useAuth as jest.Mock).mockReturnValue({ isSignedIn: mockIsSignedIn });
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it('renders the welcome message for a signed-in user', () => {
    render(<HomePage />);
    expect(screen.getByText(`Welcome back, ${mockUser.firstName} ${mockUser.lastName}!`)).toBeInTheDocument();
  });
});
