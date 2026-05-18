import { render, screen, fireEvent } from '@testing-library/react';
import SchedulePayout from '../components/SchedulePayout';

describe('Schedule Payout Component', () => {

  test('renders payout form fields', () => {

    render(<SchedulePayout />);

    expect(screen.getByText('Schedule a Payout')).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/amount/i))
      .toBeInTheDocument();

  });

  test('allows user to type in form', () => {

    render(<SchedulePayout />);

    const emailInput = screen.getByPlaceholderText(/email/i);

    fireEvent.change(emailInput, {
      target: {
        value: '2685524@students.wits.ac.za'
      }
    });

    expect(emailInput.value)
      .toBe('2685524@students.wits.ac.za');
  });

});