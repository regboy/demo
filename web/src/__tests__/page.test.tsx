import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../app/page';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ Code:"1",Result: "42",Msg:"success" })
    } as Response)
  ) as jest.Mock;
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('Calculator Page', () => {
  it('submits and shows success message', async () => {
    render(<Home />);

    fireEvent.change(screen.getByPlaceholderText('请输入参数 A'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText('请输入参数 B'), { target: { value: '32' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '+' } });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() =>
      expect(screen.getByText('Result: 42')).toBeInTheDocument()
    );
  });
  it('submits and shows error message', async () => {
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ Code: "2", Result: null, Msg: "Invalid operator!" })
      } as Response)
    ) as jest.Mock;
    render(<Home />);
    fireEvent.change(screen.getByPlaceholderText('请输入参数 A'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText('请输入参数 B'), { target: { value: '32' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '+' } });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() =>
      expect(screen.getByText(/Error: Invalid operator!/i)).toBeInTheDocument()
    );
  });
});
