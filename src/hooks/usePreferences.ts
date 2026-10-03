import { Currency, Language } from '../types/vehicle';
import { useLocalStorage } from './useLocalStorage';

export function usePreferences() {
  const [currency, setCurrency] = useLocalStorage<Currency>('autonext_currency', 'AZN');
  const [lang, setLang] = useLocalStorage<Language>('autonext_lang', 'az');

  return {
    currency,
    setCurrency,
    lang,
    setLang,
  };
}
