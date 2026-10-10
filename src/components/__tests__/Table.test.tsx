import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '../Table';

describe('Table Component', () => {
  it('renders a simple table correctly', () => {
    render(
      <Table data-testid="table">
        <TableCaption>A test table</TableCaption>
        <TableHeader data-testid="header">
          <TableRow data-testid="header-row">
            <TableHead>Head 1</TableHead>
            <TableHead>Head 2</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody data-testid="body">
          <TableRow data-testid="row-1">
            <TableCell>Cell 1</TableCell>
            <TableCell>Cell 2</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter data-testid="footer">
          <TableRow>
            <TableCell>Foot 1</TableCell>
            <TableCell>Foot 2</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    expect(screen.getByTestId('table')).toBeInTheDocument();
    expect(screen.getByText('A test table')).toBeInTheDocument();
    expect(screen.getByText('Head 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Foot 1')).toBeInTheDocument();
    
    // Check class inheritance
    expect(screen.getByTestId('table')).toHaveClass('w-full');
    expect(screen.getByTestId('header')).toHaveClass('[&_tr]:border-b');
    expect(screen.getByTestId('body')).toHaveClass('[&_tr:last-child]:border-0');
  });

  it('merges custom classes', () => {
    render(
      <Table className="custom-table">
        <TableBody>
          <TableRow className="custom-row">
            <TableCell className="custom-cell">Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const table = screen.getByText('Cell').closest('table');
    const row = screen.getByText('Cell').closest('tr');
    const cell = screen.getByText('Cell');

    expect(table).toHaveClass('custom-table');
    expect(table).toHaveClass('w-full');
    expect(row).toHaveClass('custom-row');
    expect(row).toHaveClass('border-b');
    expect(cell).toHaveClass('custom-cell');
    expect(cell).toHaveClass('p-4');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLTableElement>();
    render(<Table ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTableElement);
  });
});
