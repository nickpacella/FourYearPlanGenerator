// __mocks__/nextNavigationMock.js
const useRouter = jest.fn();
const useSearchParams = jest.fn();
useRouter.mockReturnValue({
  push: jest.fn(),
});
useSearchParams.mockReturnValue({
  get: jest.fn(),
});
export { useRouter, useSearchParams };
