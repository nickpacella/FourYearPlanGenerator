import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Home from '@/app/[[...index]]/page';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

// mock router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// mock clerk
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
  SignedIn: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SignedOut: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SignInButton: () => <button>Sign In</button>,
}));

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('Home Component', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders sign-in prompt when user is signed out', async () => {
    (useAuth as jest.Mock).mockReturnValue({ isLoaded: true, userId: null });

    render(<Home />);

    expect(screen.getByText(/welcome to the four year plan generator!/i)).toBeInTheDocument();
    expect(screen.getByText(/please sign in to access your four-year plans./i)).toBeInTheDocument();
  });

  it('redirects and adds user to database when user is signed in', async () => {
    (useAuth as jest.Mock).mockReturnValue({ isLoaded: true, userId: 'user123' });

    render(<Home />);

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/addUser', expect.any(Object)));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/home'));
  });

  it('shows error when adding user to database fails', async () => {
    (useAuth as jest.Mock).mockReturnValue({ isLoaded: true, userId: 'user123' });
    global.fetch = jest.fn(() => Promise.resolve({ ok: false })) as jest.Mock;

    render(<Home />);

    await waitFor(() => expect(console.error).toHaveBeenCalledWith('Failed to add user to database'));
  });

  it('does not call addUserToDatabase if user is not loaded', () => {
    (useAuth as jest.Mock).mockReturnValue({ isLoaded: false, userId: null });

    render(<Home />);

    expect(fetch).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('calls router.push with selected route when SignInButton is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({ isLoaded: true, userId: null });

    render(<Home />);

    const signInButton = screen.getByRole('button');
    fireEvent.click(signInButton);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('renders welcome message for signed-in users', () => {
    (useAuth as jest.Mock).mockReturnValue({ isLoaded: true, userId: 'user123' });

    render(<Home />);

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });
});
