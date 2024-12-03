// __mocks__/nextRouterMock.js
const useRouter = jest.fn();
useRouter.mockReturnValue({
  push: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  // Add other router methods if needed
});
export { useRouter };
