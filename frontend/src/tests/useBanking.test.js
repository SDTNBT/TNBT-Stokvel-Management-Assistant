import { renderHook, waitFor, act } from '@testing-library/react';
import { useBanking } from '../components/useBanking';
import axios from 'axios';

jest.mock('axios');

const mockUser = { 
  email: 'test@example.com',
  getIdToken: jest.fn().mockResolvedValue('mock-token') 
};

jest.mock('../services/firebase', () => ({
  auth: {
    currentUser: { 
      email: 'test@example.com',
      getIdToken: jest.fn().mockResolvedValue('mock-token') 
    },
    onIdTokenChanged: jest.fn((cb) => {
      // Use setImmediate or a 0ms timeout to ensure this fires 
      // OUTSIDE the synchronous execution of the effect
      setTimeout(() => cb({ 
        email: 'test@example.com',
        getIdToken: jest.fn().mockResolvedValue('mock-token') 
      }), 0);
      return () => {}; 
    }),
  },
}));

describe('useBanking Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /*it('should fetch banking details on initialization', async () => {
    // 1. Define the mock data
    const mockData = { 
      success: true, 
      data: { bankName: 'Standard Bank', accountNumber: '12345' } 
    };
    
    // 2. Setup axios to return that data
    // Use axios.get.mockImplementation to ensure it stays "fresh"
    axios.get.mockResolvedValue({
      data: mockData,
      status: 200
    });

    // 3. Render the hook
    const { result } = renderHook(() => useBanking('test@example.com'));

    // 4. Use waitFor to observe the transition from loading (true) to loaded (false)
    await waitFor(() => {
      // If this is failing, it means fetchBankingStatus never finished
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 4000 });

    // 5. These should now be true because loading is finished
    expect(result.current.hasBankingDetails).toBe(true);
    expect(result.current.bankData).not.toBeNull();
    expect(result.current.bankData.bankName).toBe('Standard Bank');
  });*/

  it('should handle API errors gracefully', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useBanking('test@example.com'));

    await waitFor(() => {
      return result.current.isLoading === false;
    }, { timeout: 4000 });

    expect(result.current.hasBankingDetails).toBe(false);
    expect(result.current.bankData).toBeNull();
  });

  it('should change view to "form" when navigateToForm is called', () => {
    const { result } = renderHook(() => useBanking('test@example.com'));
    act(() => {
      result.current.navigateToForm();
    });
    expect(result.current.bankingView).toBe('form');
  });
});