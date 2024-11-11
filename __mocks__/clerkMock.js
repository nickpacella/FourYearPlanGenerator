// __mocks__/clerkMock.js
export const useAuth = () => ({
    isSignedIn: true,
    userId: 'user_test_id',
  });
  
  export const useUser = () => ({
    user: {
      firstName: 'Test',
      lastName: 'User',
    },
  });
  