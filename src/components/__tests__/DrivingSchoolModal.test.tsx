import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DrivingSchoolModal } from '../DrivingSchoolModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('DrivingSchoolModal Component', () => {
  const defaultVehicle = MOCK_VEHICLES[0];

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <DrivingSchoolModal isOpen={false} onClose={vi.fn()} vehicle={defaultVehicle} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default autodrome tab when open', () => {
    render(<DrivingSchoolModal isOpen={true} onClose={vi.fn()} vehicle={defaultVehicle} />);
    expect(
      screen.getByText(/BDYP & Elm Nazirliyi Sürücülük Məktəbləri Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Praktiki Avtodrom/i })).toBeInTheDocument();
    expect(screen.getByText(/Estakada: 16% Yoxuşda Durma və Qalxma/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<DrivingSchoolModal isOpen={true} onClose={handleClose} vehicle={defaultVehicle} />);
    const closeBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });

  it('switches between all 5 navigation tabs cleanly', () => {
    render(<DrivingSchoolModal isOpen={true} onClose={vi.fn()} vehicle={defaultVehicle} />);

    // Tab 2: City Exam
    const cityTabBtn = screen.getByRole('button', { name: /BDYP Şəhər İmtahanı/i });
    fireEvent.click(cityTabBtn);
    expect(
      screen.getByText(/BDYP Şəhər İmtahanı Qiymətləndirməsi/i)
    ).toBeInTheDocument();

    // Tab 3: Dual Pedal
    const dualPedalTabBtn = screen.getByRole('button', { name: /Tədris Avtomobili & "U"/i });
    fireEvent.click(dualPedalTabBtn);
    expect(
      screen.getByText(/"Tədris Avtomobili" & İkili Pedal Uyğunluq Standartı/i)
    ).toBeInTheDocument();

    // Tab 4: Schools
    const schoolsTabBtn = screen.getByRole('button', { name: /Avtoməktəblər & Tariflər/i });
    fireEvent.click(schoolsTabBtn);
    expect(
      screen.getByText(/Akkreditasiya Olunmuş Rəsmi Sürücülük Məktəbləri/i)
    ).toBeInTheDocument();

    // Tab 5: Certificate
    const certTabBtn = screen.getByRole('button', { name: /Rəsmi Şəhadətnamə/i });
    fireEvent.click(certTabBtn);
    expect(
      screen.getByText(/Sürücülük Məktəbi Bitirmə Şəhadətnaməsi/i)
    ).toBeInTheDocument();
  });

  it('interacts with Estakada sliders and updates pass/fail telemetry', () => {
    render(<DrivingSchoolModal isOpen={true} onClose={vi.fn()} vehicle={defaultVehicle} />);

    // Initially rollback 12 cm -> MƏQBULDUR
    expect(screen.getByText(/MƏQBULDUR/i)).toBeInTheDocument();

    // Change stalls to 2 (fails)
    const stall2Btn = screen.getByRole('button', { name: /2 dəfə/i });
    fireEvent.click(stall2Btn);
    expect(screen.getByText(/QEYRİ-MƏQBUL/i)).toBeInTheDocument();
  });

  it('interacts with City Exam tab error items and updates score deductions', () => {
    render(<DrivingSchoolModal isOpen={true} onClose={vi.fn()} vehicle={defaultVehicle} />);

    const cityTabBtn = screen.getByRole('button', { name: /BDYP Şəhər İmtahanı/i });
    fireEvent.click(cityTabBtn);

    // Initial 100 points
    expect(screen.getByText('100')).toBeInTheDocument();

    // Click on critical error (zebra crossing)
    const pedestrianError = screen.getByText(/Piyada keçidində \(zebrada\) piyadaya yol verməmək/i);
    fireEvent.click(pedestrianError);

    // Score becomes 95 and status QEYRİ-MƏQBUL
    expect(screen.getByText('95')).toBeInTheDocument();
    expect(screen.getAllByText(/İMTAHAN QEYRİ-MƏQBULDUR/i).length).toBeGreaterThan(0);

    // Reset errors
    const resetBtn = screen.getByRole('button', { name: /Bütün xətaları sıfırla/i });
    fireEvent.click(resetBtn);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getAllByText(/İMTAHAN MƏQBULDUR/i).length).toBeGreaterThan(0);
  });

  it('switches to schools tab, filters by city and generates certificate', () => {
    render(<DrivingSchoolModal isOpen={true} onClose={vi.fn()} vehicle={defaultVehicle} />);

    const schoolsTabBtn = screen.getByRole('button', { name: /Avtoməktəblər & Tariflər/i });
    fireEvent.click(schoolsTabBtn);

    // Filter by Sumqayıt
    const sumgayitBtn = screen.getByRole('button', { name: 'Sumqayıt' });
    fireEvent.click(sumgayitBtn);
    expect(screen.getByText(/Sumqayıt Şəhər "AvtoMəktəb-1"/i)).toBeInTheDocument();

    // Click Generate Certificate
    const genBtn = screen.getByRole('button', { name: /Şəhadətnaməni Generasiya Et/i });
    fireEvent.click(genBtn);

    // Modal should now be on Certificate tab
    expect(screen.getByText(/Sürücülük Məktəbi Bitirmə Şəhadətnaməsi/i)).toBeInTheDocument();
  });

  it('handles copy, print, and registry search on certificate tab', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<DrivingSchoolModal isOpen={true} onClose={vi.fn()} vehicle={defaultVehicle} />);

    const certTabBtn = screen.getByRole('button', { name: /Rəsmi Şəhadətnamə/i });
    fireEvent.click(certTabBtn);

    // Print button
    const printBtn = screen.getByRole('button', { name: /Çap Et/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();

    // Copy code button
    const copyBtn = screen.getByRole('button', { name: /Kodu Kopyala/i });
    fireEvent.click(copyBtn);

    // Registry search for valid code
    const searchInput = screen.getByPlaceholderText(/Şəhadətnamə №/i);
    fireEvent.change(searchInput, { target: { value: 'BDYP-AVM-2026-08142' } });

    const searchBtn = screen.getByRole('button', { name: /Reyestrdə Yoxla/i });
    fireEvent.click(searchBtn);
    expect(
      screen.getByText(/Sertifikat uğurla tapıldı və bazada təsdiqləndi/i)
    ).toBeInTheDocument();
  });
});
