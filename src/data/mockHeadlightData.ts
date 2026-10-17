import {
  HeadlampHousingMarking,
  HeadlightComplianceCertificate,
  InstalledBulbType,
  OpticalServiceCenter,
} from '../utils/headlightCompliance';

export interface HousingMarkingOption {
  code: HeadlampHousingMarking;
  stampCode: string;
  title: string;
  description: string;
  allowedOemSource: string;
}

export const HEADLAMP_HOUSING_MARKINGS: HousingMarkingOption[] = [
  {
    code: 'HCR_HALOGEN',
    stampCode: 'HC / HR / HCR (E1–E4)',
    title: 'HCR — Zavod Halogen Optika (Yaxın/Uzaq)',
    description:
      'Klassik halogen (H4, H7, H11, HB3) reflektor və ya sadə linzalı korpus. Linzasız Ksenon/LED quraşdırılması İXM 342.2-1 üzrə qadağandır.',
    allowedOemSource: 'Halogen (H4/H7/H11) və ya AZS sertifikatlı Bi-LED konstruktiv paket',
  },
  {
    code: 'DC_DCR_XENON',
    stampCode: 'DC / DR / DCR (D2S / D4S)',
    title: 'DCR — Zavod Qazboşalma (Ksenon) Korpusu',
    description:
      'Zavod istehsalı linzalı Ksenon optika. UNECE R48 standartına görə avtomatik korrektor və yüksək təzyiqli fara yuyucusu məcburidir.',
    allowedOemSource: 'Zavod Ksenon (D1S, D2S, D3S, D4S — 4300K–5000K)',
  },
  {
    code: 'LED_OEM_MODULE',
    stampCode: 'LED / MD / E-Mark R112',
    title: 'LED / Matrix — Zavod Diod İşıq Modulu',
    description:
      'Müasir zavod istehsalı tam LED və ya Adaptive Matrix fara bloku. Avtomatik səviyyə tənzimləməsi ilə təchiz olunur.',
    allowedOemSource: 'Zavod İnteqrasiya Olunmuş LED / Matrix Modulu (5000K–6000K)',
  },
  {
    code: 'DOT_SAE_US',
    stampCode: 'DOT / SAE VOR / VOL',
    title: 'DOT / SAE — ABŞ İdxalı (Copart / IAAI) Korpusu',
    description:
      'Şimali Amerika bazarı üçün simmetrik işıq paylanması. Çox vaxt arxa qırmızı dönmə siqnalları ilə birlikdə gəlir.',
    allowedOemSource: 'Zavod DOT Halogen/LED (Arxa sarı dönmə konversiyası tövsiyə olunur)',
  },
  {
    code: 'JDM_RHD_HOUSING',
    stampCode: 'JIS / E43 ← RHD (Sol Bucaq)',
    title: 'JDM / UK RHD — Yaponiya İdxalı Sol-Bucaq Fara',
    description:
      'Sükanı sağda olan (Yaponiya/Böyük Britaniya) avtomobillər üçün sol tərəfə 15° qalxan şüa. Azərbaycanda qarşı zolağı birbaşa qamaşdırır!',
    allowedOemSource: 'ECE Sağ-Tərəfli Şüa Pərdəsi və ya Avropa/AZS Linza Konversiyası Tələb Olunur',
  },
];

export interface BulbTypeOption {
  id: InstalledBulbType;
  label: string;
  typicalKelvin: number;
  summary: string;
}

export const INSTALLED_BULB_OPTIONS: BulbTypeOption[] = [
  {
    id: 'halogen_oem',
    label: 'Zavod Halogen Lampa (H4 / H7 / H11 — 55W)',
    typicalKelvin: 4300,
    summary: 'HCR korpuslar üçün 100% qanuni standart sarımtıl-ağ işıq mənbəyi.',
  },
  {
    id: 'oem_xenon_d2s_d4s',
    label: 'Zavod Ksenon D2S / D4S (35W OEM Blok)',
    typicalKelvin: 4300,
    summary: 'DC/DCR markalı korpuslar üçün avtokorrektor və yuyucu ilə qanuni zavod ksenonu.',
  },
  {
    id: 'oem_led_matrix',
    label: 'Zavod Tam LED / Matrix Modul',
    typicalKelvin: 5500,
    summary: 'Müasir avtomobillərin zavod istehsalı sertifikatlı LED optikası.',
  },
  {
    id: 'biled_projector_certified',
    label: 'Sertifikatlı Bi-LED Proyektor Linza (STG Kəsimli)',
    typicalKelvin: 5500,
    summary:
      'Köhnə reflektor və ya yanmış linza əvəzinə quraşdırılan kəskin işıq-kölgə sərhədli Bi-LED modul (AZS rəyi tələb olunur).',
  },
  {
    id: 'led_bulb_retrofit',
    label: 'Sonradan Quraşdırılan LED Lampa (Reflektorda)',
    typicalKelvin: 6000,
    summary:
      'Sadə HCR reflektor faraya linzasız taxılan LED lampa — fokuslanmadığı üçün İXM 342.2-1 (150 ₼) cərimə riski daşıyır.',
  },
  {
    id: 'xenon_hid_retrofit',
    label: 'Sonradan Quraşdırılan Ksenon HID Kit (Kustar)',
    typicalKelvin: 8000,
    summary:
      'Halogen HCR faraya quraşdırılan yüksək gərginlikli HID ksenon — 150 ₼ cərimə və istismarın qadağan edilməsi.',
  },
];

export const OPTICAL_SERVICE_CENTERS: OpticalServiceCenter[] = [
  {
    id: 'optic-baku-babek',
    name: 'Baku ProLight & AZS Optik Laboratoriya Mərkəzi',
    city: 'Bakı',
    address: 'Xətai r., Babək pr. 64 (Avtoşəhər korpus 3)',
    certificationCode: 'AZS-OPT-001',
    hasLaserRegloscope: true,
    hasAzsConstructiveLab: true,
    regloscopeCalibrationFeeAzn: 25,
    lensPolishingCeramicFeeAzn: 60,
    jdmToEceConversionFeeAzn: 140,
    usAmberTurnConversionFeeAzn: 110,
    certifiedBiLedRetrofitFeeAzn: 320,
    rating: 4.9,
    phone: '+994 50 215 44 10',
  },
  {
    id: 'optic-baku-zabrat',
    name: 'BDYP Zabrat Müayinə Yanı Lazer Fara Stendi',
    city: 'Bakı',
    address: 'Sabunçu r., Zabrat-Maştağa şossesi 1-ci km',
    certificationCode: 'AZS-OPT-002',
    hasLaserRegloscope: true,
    hasAzsConstructiveLab: true,
    regloscopeCalibrationFeeAzn: 20,
    lensPolishingCeramicFeeAzn: 50,
    jdmToEceConversionFeeAzn: 130,
    usAmberTurnConversionFeeAzn: 95,
    certifiedBiLedRetrofitFeeAzn: 290,
    rating: 4.8,
    phone: '+994 55 310 88 22',
  },
  {
    id: 'optic-baku-badamdar',
    name: 'Badamdar AvtoOptika & US/JDM Konversiya Mərkəzi',
    city: 'Bakı',
    address: 'Səbail r., Badamdar şossesi, Avtomobil Satış Mərkəzi bloku B',
    certificationCode: 'AZS-OPT-005',
    hasLaserRegloscope: true,
    hasAzsConstructiveLab: true,
    regloscopeCalibrationFeeAzn: 25,
    lensPolishingCeramicFeeAzn: 65,
    jdmToEceConversionFeeAzn: 135,
    usAmberTurnConversionFeeAzn: 100,
    certifiedBiLedRetrofitFeeAzn: 340,
    rating: 4.9,
    phone: '+994 70 404 99 11',
  },
  {
    id: 'optic-khirdalan',
    name: 'Abşeron EuroLight & Lazer Kalibrasiya Servisi',
    city: 'Xırdalan',
    address: 'Bakı-Quba şossesi 9-cu km, Xırdalan dairəsi yaxınlığı',
    certificationCode: 'AZS-OPT-008',
    hasLaserRegloscope: true,
    hasAzsConstructiveLab: false,
    regloscopeCalibrationFeeAzn: 20,
    lensPolishingCeramicFeeAzn: 45,
    jdmToEceConversionFeeAzn: 120,
    usAmberTurnConversionFeeAzn: 85,
    certifiedBiLedRetrofitFeeAzn: 270,
    rating: 4.7,
    phone: '+994 50 612 77 33',
  },
  {
    id: 'optic-sumgayit',
    name: 'Sumqayıt AvtoStend & Bi-LED Texniki Mərkəzi',
    city: 'Sumqayıt',
    address: 'Sülh küçəsi 42, Avtovağzal dairəsi',
    certificationCode: 'AZS-OPT-011',
    hasLaserRegloscope: true,
    hasAzsConstructiveLab: true,
    regloscopeCalibrationFeeAzn: 18,
    lensPolishingCeramicFeeAzn: 45,
    jdmToEceConversionFeeAzn: 115,
    usAmberTurnConversionFeeAzn: 80,
    certifiedBiLedRetrofitFeeAzn: 260,
    rating: 4.8,
    phone: '+994 55 771 20 90',
  },
  {
    id: 'optic-ganja',
    name: 'Gəncə Regional Optik Nəzarət və Fara Laboratoriyası',
    city: 'Gəncə',
    address: 'Nizami Gəncəvi pr. 118, Gəncə МERO yaxınlığı',
    certificationCode: 'AZS-OPT-014',
    hasLaserRegloscope: true,
    hasAzsConstructiveLab: true,
    regloscopeCalibrationFeeAzn: 15,
    lensPolishingCeramicFeeAzn: 40,
    jdmToEceConversionFeeAzn: 110,
    usAmberTurnConversionFeeAzn: 75,
    certifiedBiLedRetrofitFeeAzn: 250,
    rating: 4.8,
    phone: '+994 50 880 34 56',
  },
];

export const VERIFIED_HEADLIGHT_CERTIFICATES: HeadlightComplianceCertificate[] = [
  {
    certificateNumber: 'BDYP-FARA-2026-10482',
    issueDate: '2026-09-14',
    expiryDate: '2027-09-14',
    plateNumber: '90-AA-777',
    vin: 'WBA5A5C50FD918273',
    vehicleTitle: '2023 BMW X5 xDrive40i M-Sport',
    housingMarking: 'LED_OEM_MODULE',
    installedBulbLabel: 'Zavod Tam LED / Matrix Modul',
    colorTemperatureKelvin: 5500,
    measuredSlopePercent: -1.4,
    measuredGlareLux: 0.45,
    beamStandardLabel: 'ECE R112 Sağ-Tərəfli (Avropa / AZS Standartı)',
    inspectionCenterName: 'Baku ProLight & AZS Optik Laboratoriya Mərkəzi',
    complianceStatus: 'KEÇİB (QANUNİ / STANDARTA UYĞUN)',
    qrVerificationHash: 'AZS-OPTIC-10482-90AA777',
  },
  {
    certificateNumber: 'BDYP-FARA-2026-30915',
    issueDate: '2026-10-02',
    expiryDate: '2027-10-02',
    plateNumber: '77-EK-505',
    vin: 'JTDKN3DU8A0192834',
    vehicleTitle: '2018 Toyota Camry Hybrid (US Spec -> ECE Konversiya)',
    housingMarking: 'HCR_HALOGEN',
    installedBulbLabel: 'Sertifikatlı Bi-LED Proyektor Linza (STG Kəsimli)',
    colorTemperatureKelvin: 5000,
    measuredSlopePercent: -1.2,
    measuredGlareLux: 0.62,
    beamStandardLabel: 'ECE R112 Sağ-Tərəfli (Avropa / AZS Standartı)',
    inspectionCenterName: 'BDYP Zabrat Müayinə Yanı Lazer Fara Stendi',
    complianceStatus: 'ŞƏRTİ QEYDİYYAT (AZS SERTİFİKATLI)',
    qrVerificationHash: 'AZS-OPTIC-30915-77EK505',
  },
  {
    certificateNumber: 'BDYP-FARA-2026-77420',
    issueDate: '2026-10-11',
    expiryDate: '2027-10-11',
    plateNumber: '99-TX-400',
    vin: 'LSJA24U6XMS091122',
    vehicleTitle: '2024 BYD Destroyer 05 Plug-in Hybrid',
    housingMarking: 'LED_OEM_MODULE',
    installedBulbLabel: 'Zavod Tam LED / Matrix Modul',
    colorTemperatureKelvin: 5500,
    measuredSlopePercent: -1.3,
    measuredGlareLux: 0.38,
    beamStandardLabel: 'ECE R112 Sağ-Tərəfli (Avropa / AZS Standartı)',
    inspectionCenterName: 'Badamdar AvtoOptika & US/JDM Konversiya Mərkəzi',
    complianceStatus: 'KEÇİB (QANUNİ / STANDARTA UYĞUN)',
    qrVerificationHash: 'AZS-OPTIC-77420-99TX400',
  },
];

export function findHeadlightCertificateByCode(
  query: string,
  customCerts: HeadlightComplianceCertificate[] = []
): HeadlightComplianceCertificate | null {
  const clean = query.trim().toUpperCase();
  if (!clean) return null;
  const all = [...customCerts, ...VERIFIED_HEADLIGHT_CERTIFICATES];
  return (
    all.find(
      (c) =>
        c.certificateNumber.toUpperCase() === clean ||
        c.plateNumber.toUpperCase() === clean ||
        c.qrVerificationHash.toUpperCase() === clean
    ) || null
  );
}
