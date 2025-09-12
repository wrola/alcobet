import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import LoadingSpinner from './LoadingSpinner';

// Wrapper component for Mantine context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    render(
      <TestWrapper>
        <LoadingSpinner />
      </TestWrapper>
    );

    const loader = screen.getByTestId('loading-spinner');
    expect(loader).toBeInTheDocument();
  });

  it('should render with custom size', () => {
    render(
      <TestWrapper>
        <LoadingSpinner size="xl" />
      </TestWrapper>
    );

    const loader = screen.getByTestId('loading-spinner');
    expect(loader).toBeInTheDocument();
  });

  it('should render with custom color', () => {
    render(
      <TestWrapper>
        <LoadingSpinner color="red" />
      </TestWrapper>
    );

    const loader = screen.getByTestId('loading-spinner');
    expect(loader).toBeInTheDocument();
  });
});