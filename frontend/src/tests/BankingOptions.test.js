import { render, screen, fireEvent } from '@testing-library/react';
import BankingOptions from '../components/BankingOptions';

describe('BankingOptions Component', () => {
  const mockProps = {
    hasBankingDetails: false,
    onViewDetails: jest.fn(),
    onAddEditDetails: jest.fn(),
    onBack: jest.fn(),
  };

  it('shows "Add Banking Details" when hasBankingDetails is false', () => {
    render(<BankingOptions {...mockProps} />);
    expect(screen.getByText(/Add Banking Details/i)).toBeInTheDocument();
  });

  it('shows "Edit Banking Details" when hasBankingDetails is true', () => {
    render(<BankingOptions {...mockProps} hasBankingDetails={true} />);
    expect(screen.getByText(/Edit Banking Details/i)).toBeInTheDocument();
  });

  it('calls onViewDetails when the view button is clicked', () => {
    render(<BankingOptions {...mockProps} />);
    fireEvent.click(screen.getByText(/View Banking Details/i));
    expect(mockProps.onViewDetails).toHaveBeenCalled();
  });
});