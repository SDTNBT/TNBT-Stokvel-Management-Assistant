import { render, screen } from '@testing-library/react';
import ViewBankingDetails from '../components/ViewBankingDetails';

describe('ViewBankingDetails Component', () => {
  const mockBankData = {
    bankName: 'FNB',
    accountNumber: '1234567890'
  };

  it('masks the account number for security', () => {
    render(<ViewBankingDetails bankData={mockBankData} onEdit={jest.fn()} onBack={jest.fn()} />);
    
    expect(screen.getByText('FNB')).toBeInTheDocument();
    // Should show bullets and only the last 4 digits
    expect(screen.getByText(/•••• •••• 7890/)).toBeInTheDocument();
  });

  it('shows "No Details Found" if bankData is missing', () => {
    render(<ViewBankingDetails bankData={null} onEdit={jest.fn()} onBack={jest.fn()} />);
    expect(screen.getByText(/No Details Found/i)).toBeInTheDocument();
  });
});