jest.mock('../services/firebase', () => ({
  auth: {
    currentUser: { getIdToken: jest.fn(() => Promise.resolve('fake-token')) },
    onIdTokenChanged: jest.fn((cb) => {
      cb({ email: 'test@example.com' });
      return () => {};
    }),
  },
}));