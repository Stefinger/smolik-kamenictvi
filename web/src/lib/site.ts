/**
 * Kontaktní údaje – telefon je hlavní konverze webu.
 * Každý odkaz na TEL musí obsahovat číslo jako text (klidně vizuálně skryté, .sr-only): Safari na iOS jinak
 * klepnutí na odkaz bez čísla blokuje hláškou „Automatické zahajování hovorů z této stránky bylo zablokováno“.
 */
export const PHONE = '606 923 347';
export const TEL = 'tel:+420606923347';
export const EMAIL = 'smolik.jarda@volny.cz';
// místo se špendlíkem na adrese skladu (souřadnice z odkazu klienta https://maps.app.goo.gl/ECbFLydDgApimRQWA)
export const MAPS = 'https://www.google.com/maps/place/Sokolsk%C3%A1+317,+783+75+Dub+nad+Moravou/@49.4857117,17.2777962,17z';

export const NAV = [
  { href: '#postup', label: 'Postup' },
  { href: '#realizace', label: 'Realizace' },
  { href: '#materialy', label: 'Materiály' },
  { href: '#kontakt', label: 'Kontakt' },
] as const;
