import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../components/Profile';

// Mock fetch
global.fetch = jest.fn();

// Mock sessionStorage
const mockUser = {
  name: 'KayGee',
  email: 'kagisokotu46@gmail.com',
  role: 'Member',
  createdAt: '2026-01-15T00:00:00.000Z',
  _id: 'user123'
};

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

beforeEach(() => {
  jest.clearAllMocks();
  Storage.prototype.getItem = jest.fn(() => JSON.stringify(mockUser));
  Storage.prototype.setItem = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

const renderWithRouter = (component) => {
  return render(component, { wrapper: BrowserRouter });
};

describe('Profile Component', () => {

  test('renders loading state initially', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    
    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);
    
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  test('displays user profile information correctly', async () => {
    const mockUserData = {
      user: {
        name: 'KayGee',
        email: 'kagisokotu46@gmail.com',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };

    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      const nameElements = screen.getAllByText('KayGee');
      expect(nameElements.length).toBeGreaterThan(0);
      expect(screen.getByText('kagisokotu46@gmail.com')).toBeInTheDocument();
    });
  });

  test('displays Account Information section', async () => {
    const mockUserData = {
      user: {
        name: 'KayGee',
        email: 'kagisokotu46@gmail.com',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Account Information')).toBeInTheDocument();
      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Email Address')).toBeInTheDocument();
    });
  });

  test('displays Stokvel Information section', async () => {
    const mockUserData = {
      user: {
        name: 'KayGee',
        email: 'kagisokotu46@gmail.com',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Stokvel Information')).toBeInTheDocument();
      expect(screen.getByText('Account Created')).toBeInTheDocument();
      expect(screen.getByText('Account Status')).toBeInTheDocument();
    });
  });

  test('displays My Groups section', async () => {
    const mockUserData = {
      user: {
        name: 'KayGee',
        email: 'kagisokotu46@gmail.com',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('My Groups')).toBeInTheDocument();
    });
  });

  test('displays account status as Inactive when user has no groups', async () => {
    const mockUserData = {
      user: {
        name: 'KayGee',
        email: 'kagisokotu46@gmail.com',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  test('navigates back when back button is clicked', async () => {
    const mockUserData = {
      user: {
        name: 'KayGee',
        email: 'kagisokotu46@gmail.com',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
    });

    const backButton = screen.getByLabelText('Go back');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('calls onLogout when logout button is clicked', async () => {
    const mockUserData = {
      user: {
        name: 'KayGee',
        email: 'kagisokotu46@gmail.com',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [];
    const mockOnLogout = jest.fn();

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalled();
  });
});
