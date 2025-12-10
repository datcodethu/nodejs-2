/* eslint-env jest */
/* @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
// Using Jest for mocks in this repo

import {
  Input,
  Button,
  ErrorMessage,
  SuccessMessage,
  AuthContainer,
  LoadingSpinner,
} from '../AuthComponents';

// Tests follow Arrange-Act-Assert structure and mock external dependencies if any.

describe('AuthComponents', () => {
  describe('Input', () => {
    test('renders label, placeholder and forwards value; calls onChange on user input', () => {
      // Arrange
      const handleChange = jest.fn();
      render(
        <Input
          label="Email"
          placeholder="you@example.com"
          value="test@example.com"
          onChange={handleChange}
        />
      );

      // Act
      const input = screen.getByPlaceholderText('you@example.com');

      // Assert
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(input).toHaveValue('test@example.com');

      // Act: fire change
      fireEvent.change(input, { target: { value: 'new@example.com' } });

      // Assert: onChange should be called
      expect(handleChange).toHaveBeenCalled();
    });

    test('shows error styling and message when error prop provided', () => {
      // Arrange
      render(<Input label="Password" error="Required" />);

      // Act
      const label = screen.getByText('Password');
      const input = label.closest('div').querySelector('input');

      // Assert
      expect(input).toHaveClass('is-invalid');
      expect(screen.getByText('Required')).toBeInTheDocument();
    });

    test('disabled prop disables the input', () => {
      // Arrange
      render(<Input label="Field" disabled={true} />);

      // Act
      const labelField = screen.getByText('Field');
      const input = labelField.closest('div').querySelector('input');

      // Assert
      expect(input).toBeDisabled();
    });
  });

  describe('Button', () => {
    test('renders children when not loading', () => {
      // Arrange
      render(<Button>Submit</Button>);

      // Act
      const btn = screen.getByRole('button', { name: 'Submit' });

      // Assert
      expect(btn).toBeEnabled();
      expect(btn).toHaveTextContent('Submit');
    });

    test('shows spinner and Processing... when loading and disables button', () => {
      // Arrange
      render(<Button loading={true}>Submit</Button>);

      // Act
      const btn = screen.getByRole('button');

      // Assert
      expect(btn).toBeDisabled();
      expect(btn).toHaveTextContent('Processing...');
      expect(btn.querySelector('.spinner-border')).toBeInTheDocument();
    });

    test('respects disabled prop and type attribute', () => {
      // Arrange
      render(
        <Button disabled={true} type="submit">
          Go
        </Button>
      );

      // Act
      const btn = screen.getByRole('button', { name: 'Go' });

      // Assert
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute('type', 'submit');
    });
  });

  describe('ErrorMessage', () => {
    test('returns null when message is falsy', () => {
      // Arrange & Act
      const { container } = render(<ErrorMessage message="" />);

      // Assert
      expect(container).toBeEmptyDOMElement();
    });

    test('renders message and calls onDismiss when close clicked', async () => {
      // Arrange
      const onDismiss = jest.fn();
      render(<ErrorMessage message="Boom" onDismiss={onDismiss} />);

      // Act
      expect(screen.getByText('Error!')).toBeInTheDocument();
      expect(screen.getByText('Boom')).toBeInTheDocument();

      const closeBtn = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeBtn);

      // Assert
      expect(onDismiss).toHaveBeenCalled();
    });
  });

  describe('SuccessMessage', () => {
    test('returns null when message is falsy', () => {
      // Arrange & Act
      const { container } = render(<SuccessMessage message={null} />);

      // Assert
      expect(container).toBeEmptyDOMElement();
    });

    test('renders success message and calls onDismiss when close clicked', () => {
      // Arrange
      const onDismiss = jest.fn();
      render(<SuccessMessage message="OK" onDismiss={onDismiss} />);

      // Act
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('OK')).toBeInTheDocument();

      const closeBtn = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeBtn);

      // Assert
      expect(onDismiss).toHaveBeenCalled();
    });
  });

  describe('AuthContainer', () => {
    test('renders title, subtitle and children', () => {
      // Arrange
      render(
        <AuthContainer title="T1" subtitle="S1">
          <div>child</div>
        </AuthContainer>
      );

      // Act & Assert
      expect(screen.getByText('T1')).toBeInTheDocument();
      expect(screen.getByText('S1')).toBeInTheDocument();
      expect(screen.getByText('child')).toBeInTheDocument();
    });
  });

  describe('LoadingSpinner', () => {
    test('renders spinner with accessible text', () => {
      // Arrange & Act
      render(<LoadingSpinner />);

      // Assert
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
