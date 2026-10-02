import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FairPriceBadge } from '../FairPriceBadge';
import { MarketPriceValuation, Language } from '../../types/vehicle';

describe('FairPriceBadge', () => {
  const lang: Language = 'en';

  it('renders correctly for a great_deal', () => {
    const valuation: MarketPriceValuation = {
      status: 'great_deal',
      percentageDiff: -15,
      confidenceScore: 92,
      avgMarketPriceAzn: 20000,
      minMarketPriceAzn: 19000,
      maxMarketPriceAzn: 22000,
      priceHistoryTrend: [],
    };

    render(<FairPriceBadge valuation={valuation} lang={lang} showDetails={true} />);

    // Expect the badge text
    expect(screen.getByText('Great Deal (15% below market)')).toBeInTheDocument();
    
    // Expect the details text
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('AI Dəqiqlik dərəcəsi:')).toBeInTheDocument();
  });

  it('renders correctly for a good_deal', () => {
    const valuation: MarketPriceValuation = {
      status: 'good_deal',
      percentageDiff: -6,
      confidenceScore: 85,
      avgMarketPriceAzn: 20000,
      minMarketPriceAzn: 19000,
      maxMarketPriceAzn: 22000,
      priceHistoryTrend: [],
    };

    render(<FairPriceBadge valuation={valuation} lang={lang} />);

    expect(screen.getByText('Good Price (6% below market)')).toBeInTheDocument();
    // Details should be hidden by default
    expect(screen.queryByText('85%')).not.toBeInTheDocument();
  });

  it('renders correctly for a fair_price', () => {
    const valuation: MarketPriceValuation = {
      status: 'fair_price',
      percentageDiff: 2,
      confidenceScore: 88,
      avgMarketPriceAzn: 20000,
      minMarketPriceAzn: 19000,
      maxMarketPriceAzn: 22000,
      priceHistoryTrend: [],
    };

    render(<FairPriceBadge valuation={valuation} lang={lang} />);

    expect(screen.getByText('Market Price')).toBeInTheDocument();
  });

  it('renders correctly for an overpriced vehicle', () => {
    const valuation: MarketPriceValuation = {
      status: 'overpriced',
      percentageDiff: 12,
      confidenceScore: 95,
      avgMarketPriceAzn: 20000,
      minMarketPriceAzn: 19000,
      maxMarketPriceAzn: 22000,
      priceHistoryTrend: [],
    };

    render(<FairPriceBadge valuation={valuation} lang={lang} />);

    expect(screen.getByText('Overpriced (+12% above market)')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const valuation: MarketPriceValuation = {
      status: 'fair_price',
      percentageDiff: 0,
      confidenceScore: 90,
      avgMarketPriceAzn: 20000,
      minMarketPriceAzn: 19000,
      maxMarketPriceAzn: 22000,
      priceHistoryTrend: [],
    };

    const { container: containerSm } = render(<FairPriceBadge valuation={valuation} lang={lang} size="sm" />);
    expect(containerSm.firstChild?.firstChild).toHaveClass('px-2', 'py-0.5', 'text-xs');

    const { container: containerLg } = render(<FairPriceBadge valuation={valuation} lang={lang} size="lg" />);
    expect(containerLg.firstChild?.firstChild).toHaveClass('px-3.5', 'py-1.5', 'text-sm', 'font-semibold');
  });
});
