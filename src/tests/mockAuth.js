export const mockAuth = {
  isAuthenticated: true,
  user: {
    uid: 'mockUserId',
    displayName: 'Mock User',
    email: 'mockuser@example.com',
  },
  signIn: jest.fn().mockResolvedValue({
    user: {
      uid: 'mockUserId',
      displayName: 'Mock User',
      email: 'mockuser@example.com',
    },
  }),
  signOut: jest.fn().mockResolvedValue(true),
};