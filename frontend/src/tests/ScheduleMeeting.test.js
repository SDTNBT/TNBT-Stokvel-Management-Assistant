import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ScheduleMeeting from '../Dashboard/ScheduleMeeting';
import axios from 'axios';
import '@testing-library/jest-dom';

jest.mock('axios');

describe('ScheduleMeeting Component', () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const renderComponent = () => render(
    <BrowserRouter>
      <ScheduleMeeting onBackToDashboard={mockOnBack} />
    </BrowserRouter>
  );

  test('renders the form correctly', () => {
    renderComponent();
    // Fix: Using a more specific query for the heading to avoid the "multiple elements" error
    expect(screen.getByRole('heading', { name: /Schedule Meeting/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Meeting Title/i)).toBeInTheDocument();
  });

  test('shows validation error if required fields are missing', async () => {
    renderComponent();
    const submitBtn = screen.getByRole('button', { name: /Schedule Meeting/i });
    fireEvent.click(submitBtn);
    expect(screen.getByText(/Please fill in all required fields/i)).toBeInTheDocument();
  });

  test('switches between Online and In-person fields', () => {
    renderComponent();
    expect(screen.getByLabelText(/Meeting Link/i)).toBeInTheDocument();

    const inPersonBtn = screen.getByText(/In-person/i);
    fireEvent.click(inPersonBtn);

    expect(screen.getByLabelText(/Meeting Room \/ Address/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Meeting Link/i)).not.toBeInTheDocument();
  });

  test('successful meeting scheduling flow', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });
    const { container } = renderComponent(); // container allows querySelector

    fireEvent.change(screen.getByLabelText(/Meeting Title/i), { target: { value: 'AGM 2026' } });
    fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2026-12-01' } });
    
    // Fix: Replaced screen.getElementById with container.querySelector
    fireEvent.change(container.querySelector('#startTime'), { target: { value: '10:00' } });
    fireEvent.change(container.querySelector('#endTime'), { target: { value: '11:00' } });
    
    fireEvent.change(screen.getByLabelText(/Meeting Link/i), { target: { value: 'https://meet.google.com/abc' } });

    fireEvent.click(screen.getByRole('button', { name: /Schedule Meeting/i }));

    await waitFor(() => {
      expect(screen.getByText(/Meeting Scheduled Successfully!/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/OK/i));
    expect(mockOnBack).toHaveBeenCalled();
  });

  test('handles API error correctly', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Network Error' } }
    });
    
    const { container } = renderComponent();
    
    fireEvent.change(screen.getByLabelText(/Meeting Title/i), { target: { value: 'Error Test' } });
    fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2026-12-01' } });
    fireEvent.change(container.querySelector('#startTime'), { target: { value: '10:00' } });
    fireEvent.change(container.querySelector('#endTime'), { target: { value: '11:00' } });
    fireEvent.change(screen.getByLabelText(/Meeting Link/i), { target: { value: 'https://meet.google.com/abc' } });

    fireEvent.click(screen.getByRole('button', { name: /Schedule Meeting/i }));

    await waitFor(() => {
      expect(screen.getByText(/Network Error/i)).toBeInTheDocument();
    });
  });
});