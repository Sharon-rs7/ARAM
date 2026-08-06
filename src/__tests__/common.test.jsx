import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Checkbox from '../components/common/Checkbox';

describe('Shared UI Components Unit Suite', () => {
  describe('Button Component', () => {
    it('renders with default props and text', () => {
      render(<Button>Submit Grievance</Button>);
      const btn = screen.getByRole('button', { name: /submit grievance/i });
      expect(btn).toBeInTheDocument();
      expect(btn).not.toBeDisabled();
    });

    it('renders loading state with spinner and text', () => {
      render(<Button loading>Submit</Button>);
      expect(screen.getByText(/loading.../i)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('renders disabled state and ignores clicks', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Click Me</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('triggers onClick handler when active', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders variant classes correctly', () => {
      render(<Button variant="danger">Delete</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-red-600');
    });
  });

  describe('Input Component', () => {
    it('renders label and handles value changes', () => {
      const handleChange = vi.fn();
      render(
        <Input
          label="Full Name"
          name="fullName"
          value="Jane Doe"
          onChange={handleChange}
          placeholder="Enter name"
        />
      );
      expect(screen.getByText(/full name/i)).toBeInTheDocument();
      const input = screen.getByPlaceholderText(/enter name/i);
      expect(input).toHaveValue('Jane Doe');
      
      fireEvent.change(input, { target: { value: 'John Doe' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('displays validation error message when error prop is provided', () => {
      render(<Input label="Email" error="Invalid email address" />);
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });

    it('renders required asterisk when required is true', () => {
      render(<Input label="Phone" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Checkbox Component', () => {
    it('toggles checked state on click', () => {
      const handleChange = vi.fn();
      render(
        <Checkbox
          label="I agree to terms"
          checked={false}
          onChange={handleChange}
        />
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      
      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });
});
