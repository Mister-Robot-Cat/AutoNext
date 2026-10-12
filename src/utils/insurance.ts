import {
  CompulsoryInsuranceBreakdown,
  InsuranceCompany,
  InsuranceInputParams,
  KaskoPackageTier,
  KaskoQuote,
  CombinedInsuranceSummary,
  PolicyApplicationFormData,
  PolicyIssuedCertificate,
  KaskoAddonKey
} from '../types/insurance';
import {
  AZERBAIJAN_INSURANCE_COMPANIES,
  BONUS_MALUS_TABLE,
  KASKO_ADDON_DEFINITIONS
} from '../data/mockInsuranceData';
import { Vehicle } from '../types/vehicle';

export const CURRENT_YEAR = 2026;

/**
 * Calculates compulsory motor third-party liability (İcbari Sığorta)
 * in accordance with Central Bank of Azerbaijan (AMB) & ISB regulations.
 */
export function calculateCompulsoryInsurance(params: InsuranceInputParams): CompulsoryInsuranceBreakdown {
  const isElectric = params.fuelType === 'electric' || params.engineVolumeLiters <= 0;
  const engineCm3 = Math.round(params.engineVolumeLiters * 1000);

  let baseTariffAzn = 50;
  let engineFactorDescription = '<= 1500 cm³';

  if (isElectric) {
    baseTariffAzn = 65;
    engineFactorDescription = 'Elektromobil (EV Baza tarifi)';
  } else if (engineCm3 <= 1500) {
    baseTariffAzn = 50;
    engineFactorDescription = '<= 1500 cm³ (50 AZN)';
  } else if (engineCm3 <= 2000) {
    baseTariffAzn = 75;
    engineFactorDescription = '1501 - 2000 cm³ (75 AZN)';
  } else if (engineCm3 <= 2500) {
    baseTariffAzn = 100;
    engineFactorDescription = '2001 - 2500 cm³ (100 AZN)';
  } else if (engineCm3 <= 3000) {
    baseTariffAzn = 125;
    engineFactorDescription = '2501 - 3000 cm³ (125 AZN)';
  } else if (engineCm3 <= 3500) {
    baseTariffAzn = 150;
    engineFactorDescription = '3001 - 3500 cm³ (150 AZN)';
  } else if (engineCm3 <= 4000) {
    baseTariffAzn = 175;
    engineFactorDescription = '3501 - 4000 cm³ (175 AZN)';
  } else if (engineCm3 <= 4500) {
    baseTariffAzn = 200;
    engineFactorDescription = '4001 - 4500 cm³ (200 AZN)';
  } else if (engineCm3 <= 5000) {
    baseTariffAzn = 225;
    engineFactorDescription = '4501 - 5000 cm³ (225 AZN)';
  } else {
    baseTariffAzn = 250;
    engineFactorDescription = '> 5000 cm³ (250 AZN)';
  }

  // Bonus-Malus Factor
  const validBmClass = Math.min(20, Math.max(1, Math.round(params.bonusMalusClass || 10)));
  const bmInfo = BONUS_MALUS_TABLE.find(b => b.classNumber === validBmClass) || BONUS_MALUS_TABLE[9];
  const bonusMalusFactor = bmInfo.factor;

  // Geographic Region Factor
  let regionFactor = 1.10;
  if (params.region === 'ganja_nakhchivan') {
    regionFactor = 1.00;
  } else if (params.region === 'regions') {
    regionFactor = 0.95;
  }

  // Driver Age and Experience Factor
  let driverFactor = 1.10;
  if (params.driverCategory === 'young_novice' || params.driverAge < 25 || params.drivingExperienceYears < 2) {
    driverFactor = 1.35;
  } else if (params.driverCategory === 'experienced' || (params.driverAge >= 30 && params.drivingExperienceYears >= 5)) {
    driverFactor = 0.95;
  }

  const finalCompulsoryPremiumAzn = Math.round(baseTariffAzn * bonusMalusFactor * regionFactor * driverFactor);
  const standardBaselinePremiumAzn = Math.round(baseTariffAzn * 1.0 * regionFactor * driverFactor);
  const bonusMalusDiscountAzn = Math.abs(standardBaselinePremiumAzn - finalCompulsoryPremiumAzn);
  const isBonusDiscount = finalCompulsoryPremiumAzn <= standardBaselinePremiumAzn;

  return {
    baseTariffAzn,
    engineFactorDescription,
    bonusMalusClass: validBmClass,
    bonusMalusFactor,
    regionFactor,
    driverFactor,
    propertyDamageLimitAzn: 5000,
    bodilyInjuryLimitAzn: 50000,
    finalCompulsoryPremiumAzn,
    standardBaselinePremiumAzn,
    bonusMalusDiscountAzn,
    isBonusDiscount
  };
}

/**
 * Calculates voluntary comprehensive KASKO insurance for a specific insurer and package tier.
 */
export function calculateKaskoQuote(
  params: InsuranceInputParams,
  company: InsuranceCompany,
  tier: KaskoPackageTier
): KaskoQuote {
  const carAge = Math.max(0, CURRENT_YEAR - params.year);

  // Age factor
  let ageFactor = 1.0;
  if (carAge <= 3) {
    ageFactor = 1.0;
  } else if (carAge <= 7) {
    ageFactor = 1.12;
  } else if (carAge <= 12) {
    ageFactor = 1.25;
  } else {
    ageFactor = 1.40;
  }

  // Official dealership repair surcharge
  let repairFactor = 1.0;
  if (params.repairType === 'official_dealer') {
    repairFactor = 1 + (company.officialDealerSurchargePercent / 100);
  }

  // Deductible / Franchise factor
  let franchiseFactor = 1.0;
  switch (params.franchise) {
    case 0:
      franchiseFactor = 1.25;
      break;
    case 100:
      franchiseFactor = 1.10;
      break;
    case 250:
      franchiseFactor = 1.00;
      break;
    case 500:
      franchiseFactor = 0.85;
      break;
    case 1000:
      franchiseFactor = 0.72;
      break;
    default:
      franchiseFactor = 1.00;
  }

  // Driver age & experience risk
  let driverRiskFactor = 1.0;
  if (params.driverCategory === 'young_novice' || params.driverAge < 25) {
    driverRiskFactor = 1.20;
  } else if (params.driverCategory === 'experienced' || (params.driverAge >= 30 && params.drivingExperienceYears >= 5)) {
    driverRiskFactor = 0.90;
  }

  // Bonus-Malus KASKO consideration
  const bmClass = Math.min(20, Math.max(1, params.bonusMalusClass || 10));
  let bmKaskoFactor = 1.0;
  if (bmClass >= 15) {
    bmKaskoFactor = 0.92;
  } else if (bmClass >= 11) {
    bmKaskoFactor = 0.96;
  } else if (bmClass < 10) {
    bmKaskoFactor = 1.08;
  }

  // Package Tier configuration
  let tierMultiplier = 1.0;
  let tierNameAz = 'Standart KASKO';
  let tierNameEn = 'Standard KASKO';
  let includedFeaturesAz: string[] = [];
  let includedFeaturesEn: string[] = [];
  let coveredRisksAz: string[] = [];
  let coveredRisksEn: string[] = [];

  if (tier === 'eco') {
    tierMultiplier = 0.72;
    tierNameAz = 'Eko / Mini-KASKO';
    tierNameEn = 'Eco Mini-KASKO';
    includedFeaturesAz = [
      'Yalnız toqquşma və əsas yol qəzaları',
      'Partnyor servisdə təmir',
      'Yüksək azadolma məbləği (Franşiza)',
      '12 aylıq faizsiz taksit'
    ];
    includedFeaturesEn = [
      'Collision & main road accident coverage only',
      'Network partner workshop repair',
      'Economical deductible structure',
      '12-month interest-free installment'
    ];
    coveredRisksAz = ['Toqquşma və qəza', 'Aşma və yuvarlanma'];
    coveredRisksEn = ['Collisions & accidents', 'Rollover damage'];
  } else if (tier === 'vip') {
    tierMultiplier = 1.35;
    tierNameAz = 'VIP / Tam KASKO';
    tierNameEn = 'VIP Comprehensive KASKO';
    includedFeaturesAz = [
      'Bütün növ qəza, təbii fəlakət, yanğın və oğurluq',
      'Rəsmi dilerdə orijinal hissələrlə qeyd-şərtsiz təmir',
      'Pulsuz əvəzedici avtomobil (10 günədək)',
      'Arayışsız şüşə və fənər təmiri daxildir',
      'Limitsiz 24/7 evakuasiya və yol yardımı daxildir'
    ];
    includedFeaturesEn = [
      'All accidents, natural disasters, fire & vehicle theft',
      'Official brand dealer repair with genuine OEM parts',
      'Free replacement vehicle (up to 10 days)',
      'No police report glass & lights repair included',
      'Unlimited 24/7 towing & roadside assistance included'
    ];
    coveredRisksAz = ['Qəza və toqquşma', 'Oğurluq və quldurluq', 'Yanğın və partlayış', 'Təbii fəlakət (dolu, sel)', 'Heyvanların vurduğu zərər', 'Üçüncü şəxslərin qərəzli hərəkətləri'];
    coveredRisksEn = ['Collisions & crashes', 'Theft & burglary', 'Fire & explosion', 'Natural disasters (hail, flood)', 'Animal impact damage', 'Third party vandalism'];
  } else {
    // standard
    tierMultiplier = 1.0;
    tierNameAz = 'Standart KASKO';
    tierNameEn = 'Standard KASKO';
    includedFeaturesAz = [
      'Yol qəzaları, yanğın, təbii fəlakət və oğurluq',
      'Seçimə görə rəsmi və ya partnyor servis',
      '24/7 dispetçer dəstəyi və zərər komissarı',
      'Faizsiz taksitlə ödəmə imkanı'
    ];
    includedFeaturesEn = [
      'Traffic accidents, fire, natural hazards & theft',
      'Choice of official dealership or partner shop',
      '24/7 emergency dispatch and claims adjuster',
      'Zero-interest monthly installments'
    ];
    coveredRisksAz = ['Qəza və toqquşma', 'Yanğın', 'Oğurluq', 'Təbii fəlakət'];
    coveredRisksEn = ['Accidents & collisions', 'Fire', 'Theft', 'Natural disasters'];
  }

  // Addons cost calculation
  let addonsCostAzn = 0;
  if (params.addons) {
    (Object.keys(params.addons) as KaskoAddonKey[]).forEach((key) => {
      if (params.addons[key]) {
        // In VIP tier, roadside assistance and glass coverage are complimentary
        if (tier === 'vip' && (key === 'roadside_assistance' || key === 'no_police_certificate_glass')) {
          return;
        }
        addonsCostAzn += KASKO_ADDON_DEFINITIONS[key]?.costAzn || 0;
      }
    });
  }

  // Base raw cost before addons
  const baseRate = company.baseKaskoRatePercent / 100;
  const rawBaseCost = params.vehiclePriceAzn * baseRate * ageFactor * repairFactor * franchiseFactor * driverRiskFactor * bmKaskoFactor * tierMultiplier;
  const baseCostAzn = Math.round(rawBaseCost);

  // Safe driver discount amount from standard
  const standardBaselineCost = params.vehiclePriceAzn * baseRate * ageFactor * repairFactor * franchiseFactor * 1.0 * 1.0 * tierMultiplier;
  const discountAzn = Math.max(0, Math.round(standardBaselineCost - baseCostAzn));

  const annualPremiumAzn = Math.max(180, baseCostAzn + addonsCostAzn);
  const monthlyInstallmentAzn = Math.round((annualPremiumAzn / 12) * 100) / 100;

  return {
    companyId: company.id,
    companyName: company.shortName,
    tier,
    tierNameAz,
    tierNameEn,
    annualPremiumAzn,
    monthlyInstallmentAzn,
    insuredValueAzn: params.vehiclePriceAzn,
    franchiseAzn: params.franchise,
    repairType: params.repairType,
    baseCostAzn,
    addonsCostAzn,
    discountAzn,
    includedFeaturesAz,
    includedFeaturesEn,
    coveredRisksAz,
    coveredRisksEn
  };
}

/**
 * Calculates comparison quotes across all companies for given configuration.
 */
export function calculateInsuranceComparison(
  params: InsuranceInputParams,
  companies: InsuranceCompany[] = AZERBAIJAN_INSURANCE_COMPANIES,
  selectedTier: KaskoPackageTier = 'standard'
): CombinedInsuranceSummary {
  const compulsory = calculateCompulsoryInsurance(params);

  const kaskoQuotes = companies.map(company => calculateKaskoQuote(params, company, selectedTier));

  // Sort by premium
  const sortedQuotes = [...kaskoQuotes].sort((a, b) => a.annualPremiumAzn - b.annualPremiumAzn);
  const cheapestQuote = sortedQuotes[0];

  // Best value is PASHA or highest satisfaction within competitive margin
  const bestValueQuote = kaskoQuotes.find(q => q.companyId === 'pasha') || sortedQuotes[0];

  // Premium quote is VIP or highest tier quote
  const vipQuotes = companies.map(c => calculateKaskoQuote(params, c, 'vip'));
  const premiumQuote = vipQuotes.find(q => q.companyId === 'pasha') || vipQuotes[0];

  return {
    compulsory,
    kaskoQuotes,
    cheapestQuote,
    bestValueQuote,
    premiumQuote
  };
}

/**
 * Generates an official digital policy certificate simulation with ASAN/SİMA digital signature.
 */
export function generateDigitalPolicyCertificate(
  application: PolicyApplicationFormData,
  vehicle: Vehicle,
  kaskoQuote: KaskoQuote,
  compulsoryBreakdown?: CompulsoryInsuranceBreakdown
): PolicyIssuedCertificate {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const issueDate = `${day}.${month}.${year}`;

  const nextYearDate = new Date(now);
  nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
  const validUntil = `${String(nextYearDate.getDate()).padStart(2, '0')}.${String(nextYearDate.getMonth() + 1).padStart(2, '0')}.${nextYearDate.getFullYear()}`;

  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const policyNumber = `AZ-POL-${year}-${randomDigits}`;
  const icbariPolicyNumber = application.includeCompulsory ? `ISB-İMS-${year}-${randomDigits + 12}` : undefined;
  const kaskoPolicyNumber = application.includeKasko ? `KSK-${kaskoQuote.companyId.toUpperCase()}-${year}-${randomDigits + 44}` : undefined;

  const compulsoryPremium = application.includeCompulsory && compulsoryBreakdown ? compulsoryBreakdown.finalCompulsoryPremiumAzn : 0;
  const kaskoPremium = application.includeKasko ? kaskoQuote.annualPremiumAzn : 0;
  const totalAnnualPremiumAzn = compulsoryPremium + kaskoPremium;
  const monthlyPaymentAzn = application.paymentPlan === 'monthly_12' ? Math.round((totalAnnualPremiumAzn / 12) * 100) / 100 : undefined;

  const randomHash = Math.random().toString(36).substring(2, 10).toUpperCase();
  const digitalSignatureId = `SIMA-AZ-CERT-${randomHash}-${year}`;
  const qrVerificationCode = `https://isb.az/verify?policy=${policyNumber}&vin=${encodeURIComponent(vehicle.vin)}`;

  return {
    policyNumber,
    icbariPolicyNumber,
    kaskoPolicyNumber,
    issueDate,
    validUntil,
    holderName: application.ownerFullName,
    finCode: application.ownerFin.toUpperCase(),
    phone: application.ownerPhone,
    vehicleTitle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    vin: vehicle.vin,
    plateNumber: application.plateNumber.toUpperCase(),
    insuranceCompanyName: kaskoQuote.companyName,
    totalAnnualPremiumAzn,
    compulsoryPremiumAzn: compulsoryPremium,
    kaskoPremiumAzn: kaskoPremium,
    franchiseAzn: kaskoQuote.franchiseAzn,
    paymentPlan: application.paymentPlan,
    monthlyPaymentAzn,
    status: 'active',
    digitalSignatureId,
    qrVerificationCode
  };
}

/**
 * Helper to format Bonus-Malus class with badge color and text.
 */
export function getBonusMalusBadgeData(bmClass: number): {
  label: string;
  badgeClass: string;
  discountPercentage: string;
} {
  const info = BONUS_MALUS_TABLE.find(b => b.classNumber === bmClass) || BONUS_MALUS_TABLE[9];
  if (info.category === 'discount') {
    return {
      label: `BM ${info.classNumber} (Güzəştli)`,
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      discountPercentage: info.percentageLabel
    };
  }
  if (info.category === 'surcharge') {
    return {
      label: `BM ${info.classNumber} (Cəriməli)`,
      badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      discountPercentage: info.percentageLabel
    };
  }
  return {
    label: `BM ${info.classNumber} (Standart)`,
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    discountPercentage: info.percentageLabel
  };
}
