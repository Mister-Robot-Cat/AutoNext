import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '../Navbar';
import { Currency, Language, Vehicle } from '../../types/vehicle';

describe('Navbar Component', () => {
  const defaultProps = {
    currency: 'AZN' as Currency,
    setCurrency: vi.fn(),
    lang: 'en' as Language,
    setLang: vi.fn(),
    theme: 'system' as const,
    onToggleTheme: vi.fn(),
    comparedVehicles: [] as Vehicle[],
    favoritesCount: 0,
    isFavoritesFilterActive: false,
    onToggleFavoritesFilter: vi.fn(),
    onOpenCompare: vi.fn(),
    onOpenCalculator: vi.fn(),
    onOpenAiAdvisor: vi.fn(),
    onOpenCreateListing: vi.fn(),
  };

  it('renders the brand logo and text correctly', () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByText('Auto')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('PRO')).toBeInTheDocument();
  });

  it('calls setLang when a language is selected', () => {
    render(<Navbar {...defaultProps} />);
    const azButton = screen.getByText('az');
    fireEvent.click(azButton);
    expect(defaultProps.setLang).toHaveBeenCalledWith('az');
  });

  it('calls setCurrency when a currency is selected', () => {
    render(<Navbar {...defaultProps} />);
    const usdButton = screen.getByText('$');
    fireEvent.click(usdButton);
    expect(defaultProps.setCurrency).toHaveBeenCalledWith('USD');
  });

  it('displays compared vehicles count if there are compared vehicles', () => {
    const mockVehicle = {
      id: '1',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      price: 25000,
      currency: 'AZN',
      mileage: 50000,
      engineVolume: 2.5,
      power: 203,
      city: 'Baku',
      views: 100,
      postedAt: '2023-10-01',
      images: ['image1.jpg'],
      isDealer: false,
      hasDamage: false,
      isVerified: true,
      condition: 'Excellent',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      bodyType: 'Sedan',
      color: 'Black'
    } as unknown as Vehicle;

    render(<Navbar {...defaultProps} comparedVehicles={[mockVehicle]} />);
    // Check if the badge "1" is rendered
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('displays favorites count if there are favorites', () => {
    render(<Navbar {...defaultProps} favoritesCount={3} />);
    // Check if the badge "3" is rendered
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls appropriate callbacks when feature buttons are clicked', () => {
    render(<Navbar {...defaultProps} />);
    
    // Calculator button (en) -> 'Loan Calculator'
    const calculatorBtn = screen.getByText('Loan Calculator');
    fireEvent.click(calculatorBtn);
    expect(defaultProps.onOpenCalculator).toHaveBeenCalled();

    // AI Advisor
    const aiAdvisorBtn = screen.getByText('AI Advisor');
    fireEvent.click(aiAdvisorBtn);
    expect(defaultProps.onOpenAiAdvisor).toHaveBeenCalled();

    // Compare
    const compareBtn = screen.getByText('Compare');
    fireEvent.click(compareBtn);
    expect(defaultProps.onOpenCompare).toHaveBeenCalled();

    // Post Ad (en) -> '+ Post a Car'
    const postAdBtn = screen.getByText('+ Post a Car');
    fireEvent.click(postAdBtn);
    expect(defaultProps.onOpenCreateListing).toHaveBeenCalled();

    // Favorites
    const favoritesBtn = screen.getByText('Seçilmişlər');
    fireEvent.click(favoritesBtn);
    expect(defaultProps.onToggleFavoritesFilter).toHaveBeenCalled();
  });

  it('renders and calls onOpenParking when provided', () => {
    const onOpenParking = vi.fn();
    render(<Navbar {...defaultProps} onOpenParking={onOpenParking} />);

    const parkingBtn = screen.getByTestId('navbar-parking-btn');
    expect(parkingBtn).toBeInTheDocument();
    fireEvent.click(parkingBtn);
    expect(onOpenParking).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenFuelStations when provided', () => {
    const onOpenFuelStations = vi.fn();
    render(<Navbar {...defaultProps} onOpenFuelStations={onOpenFuelStations} />);

    const fuelBtn = screen.getByTestId('navbar-fuel-stations-btn');
    expect(fuelBtn).toBeInTheDocument();
    fireEvent.click(fuelBtn);
    expect(onOpenFuelStations).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenEuroprotocol when provided', () => {
    const onOpenEuroprotocol = vi.fn();
    render(<Navbar {...defaultProps} onOpenEuroprotocol={onOpenEuroprotocol} />);

    const euroBtn = screen.getByTestId('navbar-europrotocol-btn');
    expect(euroBtn).toBeInTheDocument();
    fireEvent.click(euroBtn);
    expect(onOpenEuroprotocol).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenGreenCard when provided', () => {
    const onOpenGreenCard = vi.fn();
    render(<Navbar {...defaultProps} onOpenGreenCard={onOpenGreenCard} />);

    const gcBtn = screen.getByTestId('navbar-green-card-btn');
    expect(gcBtn).toBeInTheDocument();
    fireEvent.click(gcBtn);
    expect(onOpenGreenCard).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenTaxiCompliance when provided', () => {
    const onOpenTaxiCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenTaxiCompliance={onOpenTaxiCompliance} />);

    const taxiBtn = screen.getByTestId('navbar-taxi-compliance-btn');
    expect(taxiBtn).toBeInTheDocument();
    fireEvent.click(taxiBtn);
    expect(onOpenTaxiCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenTuningCompliance when provided', () => {
    const onOpenTuningCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenTuningCompliance={onOpenTuningCompliance} />);

    const tuningBtn = screen.getByTestId('navbar-tuning-compliance-btn');
    expect(tuningBtn).toBeInTheDocument();
    fireEvent.click(tuningBtn);
    expect(onOpenTuningCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenScrappage when provided', () => {
    const onOpenScrappage = vi.fn();
    render(<Navbar {...defaultProps} onOpenScrappage={onOpenScrappage} />);

    const scrappageBtn = screen.getByTestId('navbar-scrappage-btn');
    expect(scrappageBtn).toBeInTheDocument();
    fireEvent.click(scrappageBtn);
    expect(onOpenScrappage).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenImpoundLot when provided', () => {
    const onOpenImpoundLot = vi.fn();
    render(<Navbar {...defaultProps} onOpenImpoundLot={onOpenImpoundLot} />);

    const impoundBtn = screen.getByTestId('navbar-impound-lot-btn');
    expect(impoundBtn).toBeInTheDocument();
    fireEvent.click(impoundBtn);
    expect(onOpenImpoundLot).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenSpecialTraffic when provided', () => {
    const onOpenSpecialTraffic = vi.fn();
    render(<Navbar {...defaultProps} onOpenSpecialTraffic={onOpenSpecialTraffic} />);

    const specialTrafficBtn = screen.getByTestId('navbar-special-traffic-btn');
    expect(specialTrafficBtn).toBeInTheDocument();
    fireEvent.click(specialTrafficBtn);
    expect(onOpenSpecialTraffic).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenDriverLicense when provided', () => {
    const onOpenDriverLicense = vi.fn();
    render(<Navbar {...defaultProps} onOpenDriverLicense={onOpenDriverLicense} />);

    const driverLicenseBtn = screen.getByTestId('navbar-driver-license-btn');
    expect(driverLicenseBtn).toBeInTheDocument();
    fireEvent.click(driverLicenseBtn);
    expect(onOpenDriverLicense).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenTireCompliance when provided', () => {
    const onOpenTireCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenTireCompliance={onOpenTireCompliance} />);

    const tireBtn = screen.getByTestId('navbar-tire-compliance-btn');
    expect(tireBtn).toBeInTheDocument();
    fireEvent.click(tireBtn);
    expect(onOpenTireCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenHeadlightCompliance when provided', () => {
    const onOpenHeadlightCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenHeadlightCompliance={onOpenHeadlightCompliance} />);

    const headlightBtn = screen.getByTestId('navbar-headlight-compliance-btn');
    expect(headlightBtn).toBeInTheDocument();
    fireEvent.click(headlightBtn);
    expect(onOpenHeadlightCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenPassengerSafety when provided', () => {
    const onOpenPassengerSafety = vi.fn();
    render(<Navbar {...defaultProps} onOpenPassengerSafety={onOpenPassengerSafety} />);

    const safetyBtn = screen.getByTestId('navbar-passenger-safety-btn');
    expect(safetyBtn).toBeInTheDocument();
    fireEvent.click(safetyBtn);
    expect(onOpenPassengerSafety).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenEmissionsCompliance when provided', () => {
    const onOpenEmissionsCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenEmissionsCompliance={onOpenEmissionsCompliance} />);

    const emissionsBtn = screen.getByTestId('navbar-emissions-compliance-btn');
    expect(emissionsBtn).toBeInTheDocument();
    fireEvent.click(emissionsBtn);
    expect(onOpenEmissionsCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenBrakeSteering when provided', () => {
    const onOpenBrakeSteering = vi.fn();
    render(<Navbar {...defaultProps} onOpenBrakeSteering={onOpenBrakeSteering} />);

    const brakeBtn = screen.getByTestId('navbar-brake-steering-btn');
    expect(brakeBtn).toBeInTheDocument();
    fireEvent.click(brakeBtn);
    expect(onOpenBrakeSteering).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenVisibilityHorn when provided', () => {
    const onOpenVisibilityHorn = vi.fn();
    render(<Navbar {...defaultProps} onOpenVisibilityHorn={onOpenVisibilityHorn} />);

    const visBtn = screen.getByTestId('navbar-visibility-horn-btn');
    expect(visBtn).toBeInTheDocument();
    fireEvent.click(visBtn);
    expect(onOpenVisibilityHorn).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenForensicPlate when provided', () => {
    const onOpenForensicPlate = vi.fn();
    render(<Navbar {...defaultProps} onOpenForensicPlate={onOpenForensicPlate} />);

    const forensicBtn = screen.getByTestId('navbar-forensic-plate-btn');
    expect(forensicBtn).toBeInTheDocument();
    fireEvent.click(forensicBtn);
    expect(onOpenForensicPlate).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenBodyworkAdvertising when provided', () => {
    const onOpenBodyworkAdvertising = vi.fn();
    render(<Navbar {...defaultProps} onOpenBodyworkAdvertising={onOpenBodyworkAdvertising} />);

    const bodyworkBtn = screen.getByTestId('navbar-bodywork-advertising-btn');
    expect(bodyworkBtn).toBeInTheDocument();
    fireEvent.click(bodyworkBtn);
    expect(onOpenBodyworkAdvertising).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenTachographWorkRest when provided', () => {
    const onOpenTachographWorkRest = vi.fn();
    render(<Navbar {...defaultProps} onOpenTachographWorkRest={onOpenTachographWorkRest} />);

    const tachoBtn = screen.getByTestId('navbar-tachograph-work-rest-btn');
    expect(tachoBtn).toBeInTheDocument();
    fireEvent.click(tachoBtn);
    expect(onOpenTachographWorkRest).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenHvBatterySafety when provided', () => {
    const onOpenHvBatterySafety = vi.fn();
    render(<Navbar {...defaultProps} onOpenHvBatterySafety={onOpenHvBatterySafety} />);

    const hvBtn = screen.getByTestId('navbar-hv-battery-safety-btn');
    expect(hvBtn).toBeInTheDocument();
    fireEvent.click(hvBtn);
    expect(onOpenHvBatterySafety).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenSuspensionChassis when provided', () => {
    const onOpenSuspensionChassis = vi.fn();
    render(<Navbar {...defaultProps} onOpenSuspensionChassis={onOpenSuspensionChassis} />);

    const btn = screen.getByTestId('navbar-suspension-chassis-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenSuspensionChassis).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenDriverMedical when provided', () => {
    const onOpenDriverMedical = vi.fn();
    render(<Navbar {...defaultProps} onOpenDriverMedical={onOpenDriverMedical} />);

    const btn = screen.getByTestId('navbar-driver-medical-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenDriverMedical).toHaveBeenCalledTimes(1);
  });

  it('renders driving school button and calls onOpenDrivingSchool when clicked', () => {
    const onOpenDrivingSchool = vi.fn();
    render(<Navbar {...defaultProps} onOpenDrivingSchool={onOpenDrivingSchool} />);

    const btn = screen.getByTestId('navbar-driving-school-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenDrivingSchool).toHaveBeenCalledTimes(1);
  });
});
