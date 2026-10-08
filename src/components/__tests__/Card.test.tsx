import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../Card';

describe('Card', () => {
  it('renders Card with children', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders CardHeader with children', () => {
    render(<CardHeader>Header Content</CardHeader>);
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('renders CardTitle with children', () => {
    render(<CardTitle>Title Content</CardTitle>);
    expect(screen.getByText('Title Content')).toBeInTheDocument();
    expect(screen.getByText('Title Content').tagName).toBe('H3');
  });

  it('renders CardDescription with children', () => {
    render(<CardDescription>Description Content</CardDescription>);
    expect(screen.getByText('Description Content')).toBeInTheDocument();
    expect(screen.getByText('Description Content').tagName).toBe('P');
  });

  it('renders CardContent with children', () => {
    render(<CardContent>Content Area</CardContent>);
    expect(screen.getByText('Content Area')).toBeInTheDocument();
  });

  it('renders CardFooter with children', () => {
    render(<CardFooter>Footer Area</CardFooter>);
    expect(screen.getByText('Footer Area')).toBeInTheDocument();
  });

  it('applies custom classNames to components', () => {
    const { container: cardContainer } = render(<Card className="custom-card" />);
    expect(cardContainer.firstChild).toHaveClass('custom-card');

    const { container: headerContainer } = render(<CardHeader className="custom-header" />);
    expect(headerContainer.firstChild).toHaveClass('custom-header');

    const { container: titleContainer } = render(<CardTitle className="custom-title" />);
    expect(titleContainer.firstChild).toHaveClass('custom-title');

    const { container: descContainer } = render(<CardDescription className="custom-desc" />);
    expect(descContainer.firstChild).toHaveClass('custom-desc');

    const { container: contentContainer } = render(<CardContent className="custom-content" />);
    expect(contentContainer.firstChild).toHaveClass('custom-content');

    const { container: footerContainer } = render(<CardFooter className="custom-footer" />);
    expect(footerContainer.firstChild).toHaveClass('custom-footer');
  });

  it('renders a full card layout correctly', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Main Title</CardTitle>
          <CardDescription>Sub Description</CardDescription>
        </CardHeader>
        <CardContent>Body Content</CardContent>
        <CardFooter>Footer Content</CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Main Title')).toBeInTheDocument();
    expect(screen.getByText('Sub Description')).toBeInTheDocument();
    expect(screen.getByText('Body Content')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });
});
