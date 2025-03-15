// Mock environment variables
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.GOOGLE_PLACES_API_KEY = 'test_google_places_api_key';
process.env.NODE_ENV = 'test';

// Silence console logs in tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => { });
  jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterAll(() => {
  jest.restoreAllMocks();
});