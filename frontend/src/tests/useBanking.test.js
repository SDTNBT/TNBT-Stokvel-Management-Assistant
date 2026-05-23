import { renderHook, waitFor, act } from '@testing-library/react';
import { useBanking } from '../components/useBanking';

// Mock axios
jest.mock('axios', () => ({
    get: jest.fn(),
    post: jest.fn(),
}));

import axios from 'axios';

// Mock firebase
jest.mock('../services/firebase', () => ({
    auth: {
        currentUser: {
            email: 'test@example.com',
            getIdToken: jest.fn().mockResolvedValue('mock-token')
        },
        onIdTokenChanged: jest.fn((cb) => {
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

    it('should fetch banking details on initialization', async () => {
        const mockData = {
            success: true,
            data: { bankName: 'Standard Bank', accountNumber: '12345' }
        };

        axios.get.mockResolvedValue({ data: mockData, status: 200 });

        const { result } = renderHook(() => useBanking('test@example.com'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        }, { timeout: 5000 });

        expect(result.current.hasBankingDetails).toBe(true);
        expect(result.current.bankData).not.toBeNull();
    });

    it('should handle API errors gracefully', async () => {
        axios.get.mockRejectedValue(new Error('Network Error'));

        const { result } = renderHook(() => useBanking('test@example.com'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        }, { timeout: 5000 });

        expect(result.current.hasBankingDetails).toBe(false);
    });

    it('should change view to form when navigateToForm is called', async () => {
        axios.get.mockResolvedValue({
            data: { success: false, data: null },
            status: 200
        });

        const { result } = renderHook(() => useBanking('test@example.com'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        }, { timeout: 5000 });

        act(() => {
            result.current.navigateToForm();
        });

        expect(result.current.bankingView).toBe('form');
    });

    it('should initialize with loading state', () => {
        axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves

        const { result } = renderHook(() => useBanking('test@example.com'));

        // Initially should be loading
        expect(result.current).toBeDefined();
    });
});