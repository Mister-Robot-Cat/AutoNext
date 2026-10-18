import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CarDetailModal } from '../CarDetailModal';
import { Vehicle } from '../../types/vehicle';

// Mock dependencies
vi.mock('../../hooks/useShare', () => ({
  useShare: () => ({
    share: vi.fn(),
    isShared: false
  })
}));

vi.mock('../CarRotationViewer', () => ({
  CarRotationViewer: () => <div data-testid="car-rotation-viewer" />
}));

vi.mock('../PriceDepreciationChart', () => ({
  PriceDepreciationChart: () => <div data-testid="price-depreciation-chart" />
}));

vi.mock('../LightboxViewer', () => ({
  LightboxViewer: ({ onClose }: any) => (
    <div data-testid="lightbox-viewer">
      <button onClick={onClose} data-testid="close-lightbox">Close Lightbox</button>
    </div>
  )
}));

const mockVehicle: Vehicle = {
  id: '123',
  title: 'Toyota Camry XSE',
  vin: 'JT11234567890ABCD',
  make: 'Toyota',
  model: 'Camry',
  year: 2022,
  priceAzn: 45000,
  mileageKm: 15000,
  engineVolumeLiters: 2.5,
  fuelType: 'petrol',
  transmission: 'automatic',
  drivetrain: 'fwd',
  powerHp: 206,
  fuelConsumptionLPer100Km: 7.5,
  bodyType: 'sedan',
  color: 'White',
  interiorColor: 'Black',
  interiorMaterial: 'leather',
  city: 'Baku',
  images: ['img1.jpg', 'img2.jpg'],
  features: ['Bluetooth', 'Backup Camera'],
  damageReport: [
    { partId: 'front_bumper', partName: 'Front Bumper', severity: 'cosmetic_paint', notes: 'Minor scratch' },
    { partId: 'roof', partName: 'Roof', severity: 'none' }
  ],
  valuation: {
    status: 'good_deal',
    percentageDiff: -5,
    avgMarketPriceAzn: 47000,
    minMarketPriceAzn: 42000,
    maxMarketPriceAzn: 50000,
    confidenceScore: 90,
    priceHistoryTrend: []
  },
  seller: {
    id: 's1',
    name: 'Baku Prestige',
    phone: '+994501234567',
    type: 'autocenter',
    rating: 4.8,
    reviewsCount: 120,
    verifiedIdentity: true,
    memberSinceYear: 2015,
    city: 'Baku'
  },
  isVerified: true,
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2023-10-01T10:00:00Z',
  viewsCount: 250,
  description: 'Great condition description.'
};

describe('CarDetailModal', () => {
  let onCloseMock: any;
  let onOpenLoanForCarMock: any;
  let onOpenVinHistoryMock: any;
  let onOpenDealershipMock: any;

  beforeEach(() => {
    onCloseMock = vi.fn();
    onOpenLoanForCarMock = vi.fn();
    onOpenVinHistoryMock = vi.fn();
    onOpenDealershipMock = vi.fn();
  });

  const renderModal = () => render(
    <CarDetailModal
      vehicle={mockVehicle}
      currency="AZN"
      lang="az"
      onClose={onCloseMock}
      onOpenLoanForCar={onOpenLoanForCarMock}
      onOpenVinHistory={onOpenVinHistoryMock}
      onOpenDealership={onOpenDealershipMock}
    />
  );

  it('does not render if vehicle is null', () => {
    const { container } = render(
      <CarDetailModal
        vehicle={null}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders vehicle details correctly', () => {
    renderModal();
    
    expect(screen.getByText('Toyota Camry XSE')).toBeInTheDocument();
    expect(screen.getByText(/JT11234567890ABCD/)).toBeInTheDocument();
    expect(screen.getByText('Baku Prestige')).toBeInTheDocument();
    expect(screen.getByText('Great condition description.')).toBeInTheDocument();
    expect(screen.getByText('45,000 ₼')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    renderModal();
    // In our modal header, there's a close button with X icon.
    // It's the button that calls onClose.
    const closeButtons = screen.getAllByRole('button').filter(b => b.classList.contains('bg-slate-800'));
    // Usually the share and close buttons are side by side. We can target it via the X icon or click onClose mock directly.
    // Easiest is to simulate click on the specific button.
    const closeBtn = closeButtons[1]; // Share is [0], Close is [1]
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenLoanForCar when loan shortcut is clicked', () => {
    renderModal();
    const loanBtn = screen.getByText(/Kreditlə aylıq:/);
    fireEvent.click(loanBtn);
    expect(onOpenLoanForCarMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('calls onOpenVinHistory when vin shortcut is clicked', () => {
    renderModal();
    const vinBtn = screen.getByText('VIN Tarixçəsi & Yürüş Hesabatı');
    fireEvent.click(vinBtn);
    expect(onOpenVinHistoryMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('calls onOpenDealership when seller info is clicked', () => {
    renderModal();
    const sellerInfo = screen.getByText('Baku Prestige').closest('div.group');
    if (sellerInfo) {
      fireEvent.click(sellerInfo);
    }
    expect(onOpenDealershipMock).toHaveBeenCalledWith(mockVehicle.seller);
  });

  it('switches between gallery and 360 mode', () => {
    renderModal();
    
    const mode360Btn = screen.getByText('360° Studio Baxışı');
    fireEvent.click(mode360Btn);
    expect(screen.getByTestId('car-rotation-viewer')).toBeInTheDocument();

    const galleryBtn = screen.getByText('Foto Qalereya');
    fireEvent.click(galleryBtn);
    expect(screen.queryByTestId('car-rotation-viewer')).not.toBeInTheDocument();
  });

  it('opens and closes lightbox viewer', () => {
    renderModal();
    
    // Click on the main image
    const mainImg = screen.getByAltText('Toyota Camry XSE');
    fireEvent.click(mainImg);
    
    expect(screen.getByTestId('lightbox-viewer')).toBeInTheDocument();

    // Close lightbox
    const closeLightboxBtn = screen.getByTestId('close-lightbox');
    fireEvent.click(closeLightboxBtn);
    
    expect(screen.queryByTestId('lightbox-viewer')).not.toBeInTheDocument();
  });

  it('shows damage part details when a part is clicked', () => {
    renderModal();
    
    const bumperBtn = screen.getByText('Front Bumper');
    fireEvent.click(bumperBtn);
    
    // Should show details
    expect(screen.getByText('Minor scratch')).toBeInTheDocument();
  });

  it('renders AI valuation confidence gauge', () => {
    renderModal();
    expect(screen.getByTestId('valuation-confidence-gauge')).toBeInTheDocument();
    expect(screen.getByText('Dəqiqlik')).toBeInTheDocument();
  });

  it('renders market price distribution bar chart', () => {
    renderModal();
    expect(screen.getByTestId('market-price-distribution')).toBeInTheDocument();
    expect(screen.getByText('Bazar Qiymət Paylanması & Təhlili')).toBeInTheDocument();
  });

  it('triggers onOpenPriceHistory when price history shortcut button is clicked', () => {
    const onOpenPriceHistoryMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenPriceHistory={onOpenPriceHistoryMock}
      />
    );

    const priceHistoryBtn = screen.getByTestId('price-history-shortcut-btn');
    expect(priceHistoryBtn).toBeInTheDocument();
    fireEvent.click(priceHistoryBtn);
    expect(onOpenPriceHistoryMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenTcoForecast when TCO forecaster shortcut button is clicked', () => {
    const onOpenTcoForecastMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenTcoForecast={onOpenTcoForecastMock}
      />
    );

    const tcoBtn = screen.getByTestId('tco-forecaster-shortcut-btn');
    expect(tcoBtn).toBeInTheDocument();
    fireEvent.click(tcoBtn);
    expect(onOpenTcoForecastMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenTradeInValuation when trade-in shortcut button is clicked', () => {
    const onOpenTradeInValuationMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenTradeInValuation={onOpenTradeInValuationMock}
      />
    );

    const tradeInBtn = screen.getByTestId('trade-in-shortcut-btn');
    expect(tradeInBtn).toBeInTheDocument();
    fireEvent.click(tradeInBtn);
    expect(onOpenTradeInValuationMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenInspection when inspection shortcut button is clicked', () => {
    const onOpenInspectionMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenInspection={onOpenInspectionMock}
      />
    );

    const inspectionBtn = screen.getByTestId('inspection-shortcut-btn');
    expect(inspectionBtn).toBeInTheDocument();
    fireEvent.click(inspectionBtn);
    expect(onOpenInspectionMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenCustomsCalculator when customs calculator shortcut button is clicked', () => {
    const onOpenCustomsCalculatorMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenCustomsCalculator={onOpenCustomsCalculatorMock}
      />
    );

    const customsBtn = screen.getByTestId('customs-calculator-shortcut-btn');
    expect(customsBtn).toBeInTheDocument();
    fireEvent.click(customsBtn);
    expect(onOpenCustomsCalculatorMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenLienRegistry when lien registry shortcut button is clicked', () => {
    const onOpenLienRegistryMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenLienRegistry={onOpenLienRegistryMock}
      />
    );

    const lienBtn = screen.getByTestId('lien-registry-shortcut-btn');
    expect(lienBtn).toBeInTheDocument();
    fireEvent.click(lienBtn);
    expect(onOpenLienRegistryMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenBillOfSale when bill of sale shortcut button is clicked', () => {
    const onOpenBillOfSaleMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenBillOfSale={onOpenBillOfSaleMock}
      />
    );

    const billOfSaleBtn = screen.getByTestId('bill-of-sale-shortcut-btn');
    expect(billOfSaleBtn).toBeInTheDocument();
    fireEvent.click(billOfSaleBtn);
    expect(onOpenBillOfSaleMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenInsuranceCalculator when insurance calculator shortcut button is clicked', () => {
    const onOpenInsuranceMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenInsuranceCalculator={onOpenInsuranceMock}
      />
    );

    const insBtn = screen.getByTestId('insurance-calculator-shortcut-btn');
    expect(insBtn).toBeInTheDocument();
    fireEvent.click(insBtn);
    expect(onOpenInsuranceMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenEscrowSimulator when escrow simulator shortcut button is clicked', () => {
    const onOpenEscrowMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenEscrowSimulator={onOpenEscrowMock}
      />
    );

    const escrowBtn = screen.getByTestId('escrow-simulator-shortcut-btn');
    expect(escrowBtn).toBeInTheDocument();
    fireEvent.click(escrowBtn);
    expect(onOpenEscrowMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenServicePassport when service passport shortcut button is clicked', () => {
    const onOpenPassportMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenServicePassport={onOpenPassportMock}
      />
    );

    const passportBtn = screen.getByTestId('service-passport-shortcut-btn');
    expect(passportBtn).toBeInTheDocument();
    fireEvent.click(passportBtn);
    expect(onOpenPassportMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenRecallRegistry when recall registry shortcut button is clicked', () => {
    const onOpenRecallMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenRecallRegistry={onOpenRecallMock}
      />
    );

    const recallBtn = screen.getByTestId('recall-registry-shortcut-btn');
    expect(recallBtn).toBeInTheDocument();
    fireEvent.click(recallBtn);
    expect(onOpenRecallMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenTechnicalInspection when technical inspection shortcut button is clicked', () => {
    const onOpenInspectionMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenTechnicalInspection={onOpenInspectionMock}
      />
    );

    const inspectionBtn = screen.getByTestId('technical-inspection-shortcut-btn');
    expect(inspectionBtn).toBeInTheDocument();
    fireEvent.click(inspectionBtn);
    expect(onOpenInspectionMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenRegistration when registration shortcut button is clicked', () => {
    const onOpenRegistrationMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenRegistration={onOpenRegistrationMock}
      />
    );

    const registrationBtn = screen.getByTestId('registration-shortcut-btn');
    expect(registrationBtn).toBeInTheDocument();
    fireEvent.click(registrationBtn);
    expect(onOpenRegistrationMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenTrafficFines when traffic fines shortcut button is clicked', () => {
    const onOpenTrafficFinesMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenTrafficFines={onOpenTrafficFinesMock}
      />
    );

    const trafficFinesBtn = screen.getByTestId('traffic-fines-shortcut-btn');
    expect(trafficFinesBtn).toBeInTheDocument();
    fireEvent.click(trafficFinesBtn);
    expect(onOpenTrafficFinesMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenRoadsideAssistance when roadside assistance shortcut button is clicked', () => {
    const onOpenRoadsideAssistanceMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenRoadsideAssistance={onOpenRoadsideAssistanceMock}
      />
    );

    const roadsideBtn = screen.getByTestId('roadside-assistance-shortcut-btn');
    expect(roadsideBtn).toBeInTheDocument();
    fireEvent.click(roadsideBtn);
    expect(onOpenRoadsideAssistanceMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenEvCharging when EV charging shortcut button is clicked', () => {
    const onOpenEvChargingMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenEvCharging={onOpenEvChargingMock}
      />
    );

    const evBtn = screen.getByTestId('ev-charging-shortcut-btn');
    expect(evBtn).toBeInTheDocument();
    fireEvent.click(evBtn);
    expect(onOpenEvChargingMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenFuelStations when fuel station shortcut button is clicked', () => {
    const onOpenFuelStationsMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenFuelStations={onOpenFuelStationsMock}
      />
    );

    const fuelBtn = screen.getByTestId('fuel-stations-shortcut-btn');
    expect(fuelBtn).toBeInTheDocument();
    fireEvent.click(fuelBtn);
    expect(onOpenFuelStationsMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenTollRoads when toll roads shortcut button is clicked', () => {
    const onOpenTollRoadsMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenTollRoads={onOpenTollRoadsMock}
      />
    );

    const tollBtn = screen.getByTestId('toll-roads-shortcut-btn');
    expect(tollBtn).toBeInTheDocument();
    fireEvent.click(tollBtn);
    expect(onOpenTollRoadsMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenWindowTint when window tint shortcut button is clicked', () => {
    const onOpenWindowTintMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenWindowTint={onOpenWindowTintMock}
      />
    );

    const tintBtn = screen.getByTestId('window-tint-shortcut-btn');
    expect(tintBtn).toBeInTheDocument();
    fireEvent.click(tintBtn);
    expect(onOpenWindowTintMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenEuroprotocol when europrotocol shortcut button is clicked', () => {
    const onOpenEuroprotocolMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenEuroprotocol={onOpenEuroprotocolMock}
      />
    );

    const europrotocolBtn = screen.getByTestId('europrotocol-shortcut-btn');
    expect(europrotocolBtn).toBeInTheDocument();
    fireEvent.click(europrotocolBtn);
    expect(onOpenEuroprotocolMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenPowerOfAttorney when power of attorney shortcut button is clicked', () => {
    const onOpenPoaMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenPowerOfAttorney={onOpenPoaMock}
      />
    );

    const poaBtn = screen.getByTestId('poa-shortcut-btn');
    expect(poaBtn).toBeInTheDocument();
    fireEvent.click(poaBtn);
    expect(onOpenPoaMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenGreenCard when green card shortcut button is clicked', () => {
    const onOpenGreenCardMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenGreenCard={onOpenGreenCardMock}
      />
    );

    const greenCardBtn = screen.getByTestId('green-card-shortcut-btn');
    expect(greenCardBtn).toBeInTheDocument();
    fireEvent.click(greenCardBtn);
    expect(onOpenGreenCardMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenTaxiCompliance when taxi compliance shortcut button is clicked', () => {
    const onOpenTaxiComplianceMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenTaxiCompliance={onOpenTaxiComplianceMock}
      />
    );

    const taxiBtn = screen.getByTestId('taxi-compliance-shortcut-btn');
    expect(taxiBtn).toBeInTheDocument();
    fireEvent.click(taxiBtn);
    expect(onOpenTaxiComplianceMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenTuningCompliance when tuning compliance shortcut button is clicked', () => {
    const onOpenTuningComplianceMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenTuningCompliance={onOpenTuningComplianceMock}
      />
    );

    const tuningBtn = screen.getByTestId('tuning-compliance-shortcut-btn');
    expect(tuningBtn).toBeInTheDocument();
    fireEvent.click(tuningBtn);
    expect(onOpenTuningComplianceMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenScrappage when scrappage shortcut button is clicked', () => {
    const onOpenScrappageMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenScrappage={onOpenScrappageMock}
      />
    );

    const scrappageBtn = screen.getByTestId('scrappage-shortcut-btn');
    expect(scrappageBtn).toBeInTheDocument();
    fireEvent.click(scrappageBtn);
    expect(onOpenScrappageMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenImpoundLot when impound lot shortcut button is clicked', () => {
    const onOpenImpoundLotMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenImpoundLot={onOpenImpoundLotMock}
      />
    );

    const impoundBtn = screen.getByTestId('impound-lot-shortcut-btn');
    expect(impoundBtn).toBeInTheDocument();
    fireEvent.click(impoundBtn);
    expect(onOpenImpoundLotMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenSpecialTraffic when special traffic shortcut button is clicked', () => {
    const onOpenSpecialTrafficMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenSpecialTraffic={onOpenSpecialTrafficMock}
      />
    );

    const specialBtn = screen.getByTestId('special-traffic-shortcut-btn');
    expect(specialBtn).toBeInTheDocument();
    fireEvent.click(specialBtn);
    expect(onOpenSpecialTrafficMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenDriverLicense when driver license shortcut button is clicked', () => {
    const onOpenDriverLicenseMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenDriverLicense={onOpenDriverLicenseMock}
      />
    );

    const licenseBtn = screen.getByTestId('driver-license-shortcut-btn');
    expect(licenseBtn).toBeInTheDocument();
    fireEvent.click(licenseBtn);
    expect(onOpenDriverLicenseMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenTireCompliance when tire compliance shortcut button is clicked', () => {
    const onOpenTireComplianceMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenTireCompliance={onOpenTireComplianceMock}
      />
    );

    const tireBtn = screen.getByTestId('tire-compliance-shortcut-btn');
    expect(tireBtn).toBeInTheDocument();
    fireEvent.click(tireBtn);
    expect(onOpenTireComplianceMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenHeadlightCompliance when headlight compliance shortcut button is clicked', () => {
    const onOpenHeadlightComplianceMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenHeadlightCompliance={onOpenHeadlightComplianceMock}
      />
    );

    const headlightBtn = screen.getByTestId('headlight-compliance-shortcut-btn');
    expect(headlightBtn).toBeInTheDocument();
    fireEvent.click(headlightBtn);
    expect(onOpenHeadlightComplianceMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenPassengerSafety when passenger safety shortcut button is clicked', () => {
    const onOpenPassengerSafetyMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenPassengerSafety={onOpenPassengerSafetyMock}
      />
    );

    const safetyBtn = screen.getByTestId('passenger-safety-shortcut-btn');
    expect(safetyBtn).toBeInTheDocument();
    fireEvent.click(safetyBtn);
    expect(onOpenPassengerSafetyMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenEmissionsCompliance when emissions compliance shortcut button is clicked', () => {
    const onOpenEmissionsComplianceMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenEmissionsCompliance={onOpenEmissionsComplianceMock}
      />
    );

    const emissionsBtn = screen.getByTestId('emissions-compliance-shortcut-btn');
    expect(emissionsBtn).toBeInTheDocument();
    fireEvent.click(emissionsBtn);
    expect(onOpenEmissionsComplianceMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenBrakeSteering when brake & steering shortcut button is clicked', () => {
    const onOpenBrakeSteeringMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenBrakeSteering={onOpenBrakeSteeringMock}
      />
    );

    const brakeBtn = screen.getByTestId('brake-steering-shortcut-btn');
    expect(brakeBtn).toBeInTheDocument();
    fireEvent.click(brakeBtn);
    expect(onOpenBrakeSteeringMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenVisibilityHorn when visibility & horn shortcut button is clicked', () => {
    const onOpenVisibilityHornMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenVisibilityHorn={onOpenVisibilityHornMock}
      />
    );

    const visBtn = screen.getByTestId('visibility-horn-shortcut-btn');
    expect(visBtn).toBeInTheDocument();
    fireEvent.click(visBtn);
    expect(onOpenVisibilityHornMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenForensicPlate when forensic & plate shortcut button is clicked', () => {
    const onOpenForensicPlateMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenForensicPlate={onOpenForensicPlateMock}
      />
    );

    const forensicBtn = screen.getByTestId('forensic-plate-shortcut-btn');
    expect(forensicBtn).toBeInTheDocument();
    fireEvent.click(forensicBtn);
    expect(onOpenForensicPlateMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenBodyworkAdvertising when bodywork & advertising shortcut button is clicked', () => {
    const onOpenBodyworkAdvertisingMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenBodyworkAdvertising={onOpenBodyworkAdvertisingMock}
      />
    );

    const bodyworkBtn = screen.getByTestId('bodywork-advertising-shortcut-btn');
    expect(bodyworkBtn).toBeInTheDocument();
    fireEvent.click(bodyworkBtn);
    expect(onOpenBodyworkAdvertisingMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('triggers onOpenTachographWorkRest when tachograph & work/rest shortcut button is clicked', () => {
    const onOpenTachographWorkRestMock = vi.fn();
    render(
      <CarDetailModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
        onOpenTachographWorkRest={onOpenTachographWorkRestMock}
      />
    );

    const tachoBtn = screen.getByTestId('tachograph-work-rest-shortcut-btn');
    expect(tachoBtn).toBeInTheDocument();
    fireEvent.click(tachoBtn);
    expect(onOpenTachographWorkRestMock).toHaveBeenCalledWith(mockVehicle);
  });
});



