import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SavingsProjection from '../Dashboard/SavingsProjection';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          primeRate: 10.25,
          repoRate: 6.75,
          source: 'South African Reserve Bank Current Market Rates',
          lastUpdated: '2026-05-08'
        })
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('SavingsProjection component', () => {
  test('displays prime rate, repo rate, source, and last updated date', async () => {
    render(<SavingsProjection />);

    expect(await screen.findByText(/SA Rates & Savings Projection/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/10.25%/i)).toBeInTheDocument();
      expect(screen.getByText(/6.75%/i)).toBeInTheDocument();
      expect(screen.getByText(/2026-05-08/i)).toBeInTheDocument();
      expect(screen.getByText(/South African Reserve Bank/i)).toBeInTheDocument();
    });
  });

  test('calculates projected savings when user enters amount and months', async () => {
  render(<SavingsProjection />);

  await screen.findByText(/10.25%/i);

  const amountInput = screen.getByLabelText(/Savings \/ Contribution Amount/i);
  const monthsInput = screen.getByLabelText(/Projection Period in Months/i);

  fireEvent.change(amountInput, { target: { value: '1000' } });
  fireEvent.change(monthsInput, { target: { value: '12' } });

  await waitFor(() => {
    expect(screen.getByText(/Projected Savings Value/i)).toBeInTheDocument();
  });
});

  test('shows an error message when rate data cannot be loaded', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false
      })
    );

    render(<SavingsProjection />);

    await waitFor(() => {
      expect(screen.getByText(/Could not load rate data/i)).toBeInTheDocument();
    });
  });
});