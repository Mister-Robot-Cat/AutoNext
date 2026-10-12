import {
  ContractFormData,
  ContractRelationship,
  ClosingCostsBreakdown,
  ContractValidationErrors,
  GeneratedLegalDocument,
} from '../types/contract';
import { Vehicle } from '../types/vehicle';
import { NOTARY_OFFICES } from '../data/mockContractPresets';
import { MOCK_REGISTRY_RECORDS } from '../data/mockRegistryDatabase';

/**
 * Calculates official notary state duties, service fees, and BDYPİ registration costs
 * in accordance with the Law of the Republic of Azerbaijan "On State Duty" (Article 18).
 */
export function calculateNotaryAndClosingFees(params: {
  engineVolumeLiters: number;
  relationship: ContractRelationship;
  retainPlate: boolean;
}): ClosingCostsBreakdown {
  const { engineVolumeLiters, relationship, retainPlate } = params;

  // 1. Calculate standard notary state duty without relative concession
  let standardNotaryDuty = 60;
  if (engineVolumeLiters <= 1.5) {
    standardNotaryDuty = 60;
  } else if (engineVolumeLiters <= 3.0) {
    standardNotaryDuty = 90;
  } else if (engineVolumeLiters <= 5.0) {
    standardNotaryDuty = 130;
  } else {
    standardNotaryDuty = 160;
  }

  // 2. Apply statutory concession for immediate family members (close relatives)
  let notaryDutyAzn = standardNotaryDuty;
  let relativeDiscountApplied = false;
  let relativeSavingsAzn = 0;

  if (relationship === 'close_relative') {
    notaryDutyAzn = 30; // Flat concessional fee for children, parents, spouse, siblings
    relativeDiscountApplied = true;
    relativeSavingsAzn = standardNotaryDuty - 30;
  }

  // 3. Technical notarial processing fee
  const notaryServiceFeeAzn = 15;

  // 4. BDYPİ State Traffic Police Fees
  const bdypiTechPassportDutyAzn = 30; // Fee for issuing new Certificate of Vehicle Registration
  const bdypiPlateDutyAzn = retainPlate ? 0 : 35; // Keeping plate = 0 AZN, new plate = 35 AZN
  const bdypiInspectionDutyAzn = 30; // Technical inspection / forensic examination fee

  // 5. Compulsory insurance administrative transfer fee
  const insuranceTransferFeeAzn = 10;

  // Aggregate sums
  const totalStateDutyAzn =
    notaryDutyAzn + bdypiTechPassportDutyAzn + bdypiPlateDutyAzn + bdypiInspectionDutyAzn;
  const totalNotaryFeesAzn = notaryDutyAzn + notaryServiceFeeAzn;
  const totalBdypiFeesAzn =
    bdypiTechPassportDutyAzn + bdypiPlateDutyAzn + bdypiInspectionDutyAzn;
  const grandTotalAzn =
    totalNotaryFeesAzn + totalBdypiFeesAzn + insuranceTransferFeeAzn;

  return {
    notaryDutyAzn,
    notaryServiceFeeAzn,
    bdypiTechPassportDutyAzn,
    bdypiPlateDutyAzn,
    bdypiInspectionDutyAzn,
    insuranceTransferFeeAzn,
    totalStateDutyAzn,
    totalNotaryFeesAzn,
    totalBdypiFeesAzn,
    grandTotalAzn,
    relativeDiscountApplied,
    relativeSavingsAzn,
  };
}

/**
 * Converts a positive integer to words in Azerbaijani.
 */
export function numberToWordsAz(num: number): string {
  if (num === 0) return 'sıfır';
  if (num < 0) return `mənfi ${numberToWordsAz(Math.abs(num))}`;

  const ones = ['', 'bir', 'iki', 'üç', 'dörd', 'beş', 'altı', 'yeddi', 'səkkiz', 'doqquz'];
  const tens = ['', 'on', 'iyirmi', 'otuz', 'qırx', 'əlli', 'altmış', 'yetmiş', 'səksən', 'doxsan'];

  const convertChunk = (n: number): string => {
    let result = '';
    const h = Math.floor(n / 100);
    const remainder = n % 100;
    const t = Math.floor(remainder / 10);
    const o = remainder % 10;

    if (h > 0) {
      result += h === 1 ? 'yüz' : `${ones[h]} yüz`;
    }
    if (t > 0) {
      result += (result ? ' ' : '') + tens[t];
    }
    if (o > 0) {
      result += (result ? ' ' : '') + ones[o];
    }
    return result;
  };

  const rounded = Math.floor(num);
  const millions = Math.floor(rounded / 1000000);
  const thousands = Math.floor((rounded % 1000000) / 1000);
  const remaining = rounded % 1000;

  const parts: string[] = [];

  if (millions > 0) {
    parts.push(millions === 1 ? 'bir milyon' : `${convertChunk(millions)} milyon`);
  }
  if (thousands > 0) {
    parts.push(thousands === 1 ? 'min' : `${convertChunk(thousands)} min`);
  }
  if (remaining > 0) {
    parts.push(convertChunk(remaining));
  }

  return parts.join(' ').trim();
}

/**
 * Converts a positive integer to words in English.
 */
export function numberToWordsEn(num: number): string {
  if (num === 0) return 'zero';
  if (num < 0) return `minus ${numberToWordsEn(Math.abs(num))}`;

  const ones = [
    '',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'elever',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ];
  // Correct index 11
  ones[11] = 'eleven';

  const tens = [
    '',
    '',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
  ];

  const convertChunk = (n: number): string => {
    let result = '';
    const h = Math.floor(n / 100);
    const remainder = n % 100;

    if (h > 0) {
      result += `${ones[h]} hundred`;
    }
    if (remainder > 0) {
      if (result) result += ' ';
      if (remainder < 20) {
        result += ones[remainder];
      } else {
        const t = Math.floor(remainder / 10);
        const o = remainder % 10;
        result += tens[t] + (o > 0 ? `-${ones[o]}` : '');
      }
    }
    return result;
  };

  const rounded = Math.floor(num);
  const millions = Math.floor(rounded / 1000000);
  const thousands = Math.floor((rounded % 1000000) / 1000);
  const remaining = rounded % 1000;

  const parts: string[] = [];

  if (millions > 0) {
    parts.push(`${convertChunk(millions)} million`);
  }
  if (thousands > 0) {
    parts.push(`${convertChunk(thousands)} thousand`);
  }
  if (remaining > 0) {
    parts.push(convertChunk(remaining));
  }

  return parts.join(' ').trim();
}

/**
 * Validates FİN code: 7 alphanumeric uppercase characters.
 */
export function isValidFinCode(fin: string): boolean {
  return /^[A-Z0-9]{7}$/i.test(fin.trim());
}

/**
 * Validates VIN: 17 alphanumeric characters (excluding letters I, O, Q standard).
 */
export function isValidVin(vin: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin.trim());
}

/**
 * Standardizes plate format, e.g. "90AA530" or "90-AA-530" -> "90-AA-530".
 */
export function formatPlateNumber(plate: string): string {
  const cleaned = plate.replace(/[\s-]/g, '').toUpperCase();
  const match = cleaned.match(/^(\d{2})([A-Z]{2})(\d{3})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return plate.trim().toUpperCase();
}

/**
 * Cleans FİN code to uppercase alphanumeric (max 7 characters).
 */
export function formatFinCode(fin: string): string {
  return fin.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7);
}

/**
 * Formats phone string for readability.
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned;
}

/**
 * Validates contract form data and returns typed errors and completeness percentage.
 */
export function validateContractForm(data: ContractFormData): {
  isValid: boolean;
  errors: ContractValidationErrors;
  completenessScore: number;
} {
  const errors: ContractValidationErrors = {};
  let totalRequiredFields = 0;
  let filledValidFields = 0;

  const checkField = (
    category: 'seller' | 'buyer' | 'vehicle' | 'financials',
    field: string,
    valid: boolean,
    errorMessage: string
  ) => {
    totalRequiredFields++;
    if (valid) {
      filledValidFields++;
    } else {
      if (!errors[category]) {
        errors[category] = {} as any;
      }
      (errors[category] as any)[field] = errorMessage;
    }
  };

  // 1. Seller validation
  checkField(
    'seller',
    'fullName',
    Boolean(data.seller.fullName && data.seller.fullName.trim().length >= 3),
    'Satıcının tam adı ən azı 3 hərfdən ibarət olmalıdır'
  );
  checkField(
    'seller',
    'idSeries',
    Boolean(data.seller.idSeries && data.seller.idSeries.trim().length > 0),
    'Şəxsiyyət vəsiqəsinin seriyası qeyd edilməlidir'
  );
  checkField(
    'seller',
    'idNumber',
    Boolean(data.seller.idNumber && data.seller.idNumber.trim().length >= 4),
    'Vəsiqə nömrəsi daxil edilməlidir'
  );
  checkField(
    'seller',
    'finCode',
    isValidFinCode(data.seller.finCode),
    'FİN kod 7 rəqəm və ya hərfdən ibarət olmalıdır'
  );
  checkField(
    'seller',
    'phone',
    Boolean(data.seller.phone && data.seller.phone.trim().length >= 7),
    'Əlaqə nömrəsi qeyd edilməlidir'
  );

  // 2. Buyer validation
  checkField(
    'buyer',
    'fullName',
    Boolean(data.buyer.fullName && data.buyer.fullName.trim().length >= 3),
    'Alıcının tam adı ən azı 3 hərfdən ibarət olmalıdır'
  );
  checkField(
    'buyer',
    'idSeries',
    Boolean(data.buyer.idSeries && data.buyer.idSeries.trim().length > 0),
    'Şəxsiyyət vəsiqəsinin seriyası qeyd edilməlidir'
  );
  checkField(
    'buyer',
    'idNumber',
    Boolean(data.buyer.idNumber && data.buyer.idNumber.trim().length >= 4),
    'Vəsiqə nömrəsi daxil edilməlidir'
  );
  checkField(
    'buyer',
    'finCode',
    isValidFinCode(data.buyer.finCode),
    'FİN kod 7 rəqəm və ya hərfdən ibarət olmalıdır'
  );
  checkField(
    'buyer',
    'phone',
    Boolean(data.buyer.phone && data.buyer.phone.trim().length >= 7),
    'Əlaqə nömrəsi qeyd edilməlidir'
  );

  // 3. Vehicle validation
  checkField(
    'vehicle',
    'make',
    Boolean(data.vehicle.make && data.vehicle.make.trim().length > 0),
    'Marka qeyd edilməlidir'
  );
  checkField(
    'vehicle',
    'model',
    Boolean(data.vehicle.model && data.vehicle.model.trim().length > 0),
    'Model qeyd edilməlidir'
  );
  checkField(
    'vehicle',
    'year',
    Boolean(data.vehicle.year >= 1970 && data.vehicle.year <= new Date().getFullYear() + 1),
    'Buraxılış ili düzgün daxil edilməlidir'
  );
  checkField(
    'vehicle',
    'vin',
    Boolean(data.vehicle.vin && data.vehicle.vin.trim().length === 17),
    'VIN kodu 17 simvoldan ibarət olmalıdır'
  );
  checkField(
    'vehicle',
    'plateNumber',
    Boolean(data.vehicle.plateNumber && data.vehicle.plateNumber.trim().length >= 5),
    'Dövlət nömrə nişanı qeyd edilməlidir'
  );
  checkField(
    'vehicle',
    'techPassportNumber',
    Boolean(data.vehicle.techPassportNumber && data.vehicle.techPassportNumber.trim().length >= 4),
    'Texniki pasport nömrəsi daxil edilməlidir'
  );

  // 4. Financials validation
  checkField(
    'financials',
    'priceAzn',
    Boolean(data.financials.priceAzn && data.financials.priceAzn > 0),
    'Satış qiyməti 0-dan böyük olmalıdır'
  );
  checkField(
    'financials',
    'depositAzn',
    Boolean(
      data.financials.depositAzn >= 0 &&
        data.financials.depositAzn <= data.financials.priceAzn
    ),
    'Beh məbləği ümumi qiymətdən çox ola bilməz'
  );

  const completenessScore = Math.round((filledValidFields / totalRequiredFields) * 100);
  const isValid = completenessScore === 100;

  return { isValid, errors, completenessScore };
}

/**
 * Initializes a ContractFormData object from a given Vehicle and optional Seller.
 */
export function buildVehicleInitialContractData(
  vehicle?: Vehicle | null,
  sellerOverride?: { name: string; phone?: string } | null
): ContractFormData {
  const defaultNotary = NOTARY_OFFICES[1]; // 5 saylı Bakı Notariat Kontoru

  const sellerName = sellerOverride?.name || vehicle?.seller.name || 'Quliyev Rəşad İlham oğlu';
  const sellerPhone = sellerOverride?.phone || vehicle?.seller.phone || '+994 50 234 56 78';

  return {
    seller: {
      fullName: sellerName,
      idSeries: 'AZE',
      idNumber: '19482012',
      finCode: '6JK9L2P',
      address: 'Bakı şəhəri, Nəsimi rayonu, Mirzəağa Əliyev küçəsi 44',
      phone: sellerPhone,
      isIndividual: true,
    },
    buyer: {
      fullName: 'Əliyev Teymur Eldar oğlu',
      idSeries: 'AZE',
      idNumber: '29381045',
      finCode: '7MK4T1B',
      address: 'Bakı şəhəri, Xətai rayonu, Sarayevo küçəsi 19, mənzil 84',
      phone: '+994 55 987 65 43',
      isIndividual: true,
    },
    vehicle: {
      make: vehicle?.make || 'BMW',
      model: vehicle?.model || '530i M Sport',
      year: vehicle?.year || 2022,
      vin: vehicle?.vin || 'WBA5A7C50JB192841',
      plateNumber:
        (vehicle && MOCK_REGISTRY_RECORDS.find((r) => r.vin === vehicle.vin)?.plateNumber) ||
        '90-AA-530',
      engineNumber: `ENG-${(vehicle?.vin || '192841').slice(-6)}`,
      engineVolumeLiters: vehicle?.engineVolumeLiters || 2.0,
      chassisNumber: vehicle?.vin || 'WBA5A7C50JB192841',
      bodyType: vehicle?.bodyType || 'Sedan',
      color: vehicle?.color || 'Qara Metalik',
      techPassportSeries: 'AA',
      techPassportNumber: '948201',
      registrationDate: `${vehicle?.year || 2022}-06-15`,
    },
    financials: {
      priceAzn: vehicle?.priceAzn || 52000,
      depositAzn: 2000,
      paymentMethod: 'bank_transfer',
      bankName: 'Kapital Bank ASC',
      ibanOrAccount: 'AZ42AIIB38010019482041002341',
    },
    metadata: {
      contractNumber: `NOT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().split('T')[0],
      city: 'Bakı',
      notaryOfficeId: defaultNotary.id,
      notaryName: defaultNotary.notaryName,
      registryNumber: `7N-${Math.floor(1000 + Math.random() * 9000)}`,
      retainPlate: true,
      relationship: 'unrelated',
    },
  };
}

/**
 * Generates official bilingual legal text for the Notarized Vehicle Bill of Sale.
 */
export function generateLegalContractDocument(data: ContractFormData): GeneratedLegalDocument {
  const { seller, buyer, vehicle, financials, metadata } = data;
  const notaryOffice =
    NOTARY_OFFICES.find((n) => n.id === metadata.notaryOfficeId) || NOTARY_OFFICES[0];

  const priceWordsAz = numberToWordsAz(financials.priceAzn);
  const priceWordsEn = numberToWordsEn(financials.priceAzn);
  const depositWordsAz = numberToWordsAz(financials.depositAzn);
  const depositWordsEn = numberToWordsEn(financials.depositAzn);

  const paymentMethodLabelAz =
    financials.paymentMethod === 'bank_transfer'
      ? `Bank köçürməsi yolu ilə (${financials.bankName || 'Müvəkkil Bank'})`
      : financials.paymentMethod === 'escrow'
      ? `Rəqəmsal Notariat Eskrou depozit hesabı vasitəsilə`
      : 'Nağd qaydada (notariusun iştirakı ilə)';

  const paymentMethodLabelEn =
    financials.paymentMethod === 'bank_transfer'
      ? `Via wire bank transfer (${financials.bankName || 'Authorized Commercial Bank'})`
      : financials.paymentMethod === 'escrow'
      ? `Via Digital Notary Escrow Account`
      : 'In cash (before the attending Notary)';

  // Official Azerbaijani Text conforming to AR Civil Code Articles 656-680
  const azText = `
AZƏRBAYCAN RESPUBLİKASI ƏDLİYYƏ NAZİRLİYİ
${notaryOffice.nameAz.toUpperCase()}
Dövlət Reyestr №: ${metadata.registryNumber} | Müqavilə №: ${metadata.contractNumber}

NƏQLİYYAT VASİTƏSİNİN NOTARİAL ALQI-SATQI MÜQAVİLƏSİ

${metadata.city} şəhəri                                                          Tarix: ${metadata.date}

Biz, aşağıda imza edənlər:
1. SATICI: ${seller.fullName}, Ş/V: ${seller.idSeries} № ${seller.idNumber}, FİN: ${seller.finCode}, 
   Yaşayış ünvanı: ${seller.address}, Telefon: ${seller.phone}
   (bundan sonra mətndə «Satıcı» adlandırılacaq), bir tərəfdən, və

2. ALICI: ${buyer.fullName}, Ş/V: ${buyer.idSeries} № ${buyer.idNumber}, FİN: ${buyer.finCode}, 
   Yaşayış ünvanı: ${buyer.address}, Telefon: ${buyer.phone}
   (bundan sonra mətndə «Alıcı» adlandırılacaq), digər tərəfdən,

Azərbaycan Respublikası Mülki Məcəlləsinin 656-680-ci maddələrinə və «Notariat haqqında» AR Qanununa əsasən 
könüllü olaraq aşağıdakı şərtlərlə hazırkı Alqı-Satqı Müqaviləsini bağladıq:

1. MÜQAVİLƏNİN PREDMETİ
1.1. Satıcı ona şəxsi mülkiyyət hüququ əsasında məxsus olan (Qeydiyyat Şəhadətnaməsi: ${vehicle.techPassportSeries} № ${vehicle.techPassportNumber}), 
     aşağıda göstərilən parametrlərə malik nəqliyyat vasitəsini Alıcının mülkiyyətinə satır, Alıcı isə həmin nəqliyyat 
     vasitəsini qəbul edərək onun dəyərini ödəməyi öhdəsinə götürür:
     - Marka və Model: ${vehicle.make} ${vehicle.model}
     - Buraxılış ili: ${vehicle.year}
     - Şassi / VIN kodu: ${vehicle.vin}
     - Dövlət Qeydiyyat Nişanı: ${vehicle.plateNumber}
     - Mühərrik № və Həcmi: ${vehicle.engineNumber} (${vehicle.engineVolumeLiters > 0 ? `${vehicle.engineVolumeLiters} L` : 'Elektrik'})
     - Ban növü və Rəngi: ${vehicle.bodyType}, ${vehicle.color}

2. QİYMƏT VƏ HESABLAŞMA QAYDASI
2.1. Tərəflərin qarşılıqlı razılığına əsasən nəqliyyat vasitəsinin satış qiyməti ${financials.priceAzn.toLocaleString()} (${priceWordsAz}) AZN müəyyən edilmişdir.
2.2. Əvvəlcədən ödənilmiş beh/avans məbləği: ${financials.depositAzn.toLocaleString()} (${depositWordsAz}) AZN təşkil edir.
2.3. Ödəniş üsulu: ${paymentMethodLabelAz}.
${financials.ibanOrAccount ? `     (Hesab / IBAN rekviziti: ${financials.ibanOrAccount})` : ''}

3. TƏRƏFLƏRİN BƏYANAT VƏ TƏMİNATLARI
3.1. Satıcı təminat verir ki, satılan nəqliyyat vasitəsi heç kimə satılmayıb, girov qoyulmayıb, məhkəmə və ya vergi orqanları 
     tərəfindən üzərinə həbs qoyulmayıb, axtarışda deyil və üçüncü şəxslərin hüquqları ilə yüklü deyildir.
3.2. Satıcı həmçinin təsdiq edir ki, nəqliyyat vasitəsinin BDYPİ MMX radarlarında qeydə alınmış ödənilməmiş cərimələri yoxdur 
     və ya müqavilə anına qədər olan bütün cərimələri ödəməyə tam məsuldur.
3.3. Alıcı nəqliyyat vasitəsinin cari texniki vəziyyəti, komplektasiyası və qüsurları ilə əvvəlcədən tanış olduğunu və iddia etmədiyini bildirir.

4. MÜLKİYYƏT HÜQUQUNUN KEÇMƏSİ VƏ BDYPİ-DƏ QEYDİYYAT
4.1. Nəqliyyat vasitəsinə mülkiyyət hüququ hazırkı müqavilə notariat qaydasında təsdiq edildiyi andan Alıcıya keçir.
4.2. «Yol hərəkəti haqqında» AR Qanununa əsasən, Alıcı müqavilə bağlandığı gündən 10 (on) gün müddətində nəqliyyat 
     vasitəsini DİN Baş Dövlət Yol Polisi İdarəsinin Qeydiyyat-İmtahan şöbəsində öz adına rəsmi dövlət qeydiyyatına aldırmalıdır.
4.3. Dövlət nömrə nişanı: ${metadata.retainPlate ? 'Mövcud nömrə nişanı saxlanılır və Alıcının adına rəsmiləşdirilir' : 'Nömrə təhvil verilir, Alıcıya yeni dövlət qeydiyyat nişanı verilir'}.

5. NOTARİAT QEYDİ VƏ TƏSDİQ FORMULASI
Müqavilə tərəflərin iştirakı ilə oxunmuş, hüquq və vəzifələri izah edilmişdir. Müqavilə eyni hüquqi qüvvəyə malik 3 (üç) nüsxədə tərtib 
edilmişdir (bir nüsxəsi notariat kontorunda saxlanılır, digər nüsxələri Satıcıya və Alıcıya verilir).

TƏRƏFLƏRİN İMZALARI:

SATICI: ______________________ / ${seller.fullName} /
ALICI:  ______________________ / ${buyer.fullName} /

NOTARİUSUN TƏSDİQ QEYDİ:
Mən, ${notaryOffice.nameAz}-nun notariusu ${metadata.notaryName}, təsdiq edirəm ki, hazırkı müqavilə tərəflərin fəaliyyət qabiliyyəti yoxlanılaraq 
onların tam iradə azadlığı ilə imzalanmışdır.
Reyestrdə qeydə alındı: № ${metadata.registryNumber}
M.Y. (Möhür Yeri)                                                        Notarius: ______________________
`.trim();

  // Official English Text for International / Dual Representation
  const enText = `
MINISTRY OF JUSTICE OF THE REPUBLIC OF AZERBAIJAN
${notaryOffice.nameEn.toUpperCase()}
State Registry Record No: ${metadata.registryNumber} | Contract Ref: ${metadata.contractNumber}

OFFICIAL VEHICLE BILL OF SALE & PURCHASE AGREEMENT

City: ${metadata.city}                                                              Date: ${metadata.date}

BETWEEN:
1. THE SELLER: ${seller.fullName}, ID Card: ${seller.idSeries} No: ${seller.idNumber}, FIN Code: ${seller.finCode},
   Address: ${seller.address}, Phone: ${seller.phone}
   (hereinafter referred to as the "Seller"), of the one part; and

2. THE BUYER: ${buyer.fullName}, ID Card: ${buyer.idSeries} No: ${buyer.idNumber}, FIN Code: ${buyer.finCode},
   Address: ${buyer.address}, Phone: ${buyer.phone}
   (hereinafter referred to as the "Buyer"), of the other part;

Pursuant to Articles 656-680 of the Civil Code of the Republic of Azerbaijan and the Law of the Republic of Azerbaijan "On Notaries", 
the Parties voluntarily agree as follows:

1. SUBJECT MATTER OF THE CONTRACT
1.1. The Seller sells and transfers title to the motor vehicle owned by them (Registration Certificate: ${vehicle.techPassportSeries} No: ${vehicle.techPassportNumber}) 
     to the Buyer, and the Buyer accepts and agrees to purchase the vehicle under the following specifications:
     - Make & Model: ${vehicle.make} ${vehicle.model}
     - Year of Manufacture: ${vehicle.year}
     - Chassis / VIN Number: ${vehicle.vin}
     - License Plate Number: ${vehicle.plateNumber}
     - Engine No & Displacement: ${vehicle.engineNumber} (${vehicle.engineVolumeLiters > 0 ? `${vehicle.engineVolumeLiters} L` : 'Electric'})
     - Body Style & Color: ${vehicle.bodyType}, ${vehicle.color}

2. PURCHASE PRICE AND PAYMENT TERMS
2.1. The mutually agreed purchase price is ${financials.priceAzn.toLocaleString()} (${priceWordsEn}) AZN.
2.2. Advance / Deposit payment received: ${financials.depositAzn.toLocaleString()} (${depositWordsEn}) AZN.
2.3. Method of Payment: ${paymentMethodLabelEn}.
${financials.ibanOrAccount ? `     (Bank IBAN / Account: ${financials.ibanOrAccount})` : ''}

3. REPRESENTATIONS AND WARRANTIES
3.1. The Seller expressly warrants that the motor vehicle is free and clear of all liens, encumbrances, pledges, court attachments, 
     sequestrations, and claims by third parties.
3.2. The Seller confirms that all traffic fines (MMX) accrued prior to this transaction are either cleared or remain the sole liability of the Seller.
3.3. The Buyer acknowledges having inspected the physical and technical condition of the vehicle prior to execution.

4. TRANSFER OF TITLE AND POLICE REGISTRATION
4.1. Title to the vehicle passes to the Buyer upon notarial certification hereof.
4.2. In compliance with the Law of the Republic of Azerbaijan "On Road Traffic", the Buyer shall register the vehicle with the 
     State Traffic Police Department (BDYPİ) within 10 (ten) calendar days.
4.3. Registration plate: ${metadata.retainPlate ? 'Existing state plate number retained by Buyer' : 'State plate surrendered; new plate to be issued'}.

5. NOTARIAL CERTIFICATION
Executed in 3 (three) original counterparts of equal legal validity.

SIGNATURES OF THE PARTIES:

SELLER: ______________________ / ${seller.fullName} /
BUYER:  ______________________ / ${buyer.fullName} /

NOTARIAL ATTESTATION:
I, ${metadata.notaryName}, Notary of ${notaryOffice.nameEn}, certify that the parties appeared before me, their identities and legal capacities 
were duly established, and they freely executed this contract.
Recorded in Register: No. ${metadata.registryNumber}
L.S. (Official Seal)                                                     Notary: ______________________
`.trim();

  return {
    documentId: metadata.contractNumber,
    azText,
    enText,
    titleAz: 'Nəqliyyat Vasitəsinin Notarial Alqı-Satqı Müqaviləsi',
    titleEn: 'Official Notarized Vehicle Purchase & Sale Contract',
    generatedDate: metadata.date,
  };
}
