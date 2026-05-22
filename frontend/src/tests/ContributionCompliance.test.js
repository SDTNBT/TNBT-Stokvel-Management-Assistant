import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ContributionCompliance from '../components/ContributionCompliance';

// Mock fetch
global.fetch = jest.fn();

// Mock sessionStorage
const mockUser = {
  email: 'member@stokvel.com',
  name: 'Test Member',
  surname: 'User'
};

beforeEach(() => {
  jest.clearAllMocks();
  Storage.prototype.getItem = jest.fn(() => JSON.stringify(mockUser));
});

afterEach(() => {
  jest.resetAllMocks();
});

const renderWithRouter = (component) => {
  return render(component, { wrapper: BrowserRouter });
};

describe('ContributionCompliance Component', () => {

  test('renders loading state initially', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    
    renderWithRouter(<ContributionCompliance user={mockUser} groupName="Test Group" />);
    
    expect(screen.getByText('Loading compliance report...')).toBeInTheDocument();
  });

  test('displays no groups message when user is not in any group', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    renderWithRouter(<ContributionCompliance user={mockUser} groupName="Test Group" />);

    await waitFor(() => {
      expect(screen.getByText('You are not a member of any groups yet. Join a group to see your compliance report.')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    fetch.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<ContributionCompliance user={mockUser} groupName="Test Group" />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load data: Network error')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});
