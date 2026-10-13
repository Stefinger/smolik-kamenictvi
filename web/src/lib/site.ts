/**
 * Kontaktní údaje – telefon je hlavní konverze webu.
 * Každý odkaz na TEL musí obsahovat číslo jako text (klidně vizuálně skryté, .sr-only): Safari na iOS jinak
 * klepnutí na odkaz bez čísla blokuje hláškou „Automatické zahajování hovorů z této stránky bylo zablokováno“.
 */
export const PHONE = '606 923 347';
export const TEL = 'tel:+420606923347';
export const EMAIL = 'smolik.jarda@volny.cz';
export const MAPS = 'https://maps.app.goo.gl/ECbFLydDgApimRQWA';

export const NAV = [
  { href: '#postup', label: 'Postup' },
  { href: '#realizace', label: 'Realizace' },
  { href: '#materialy', label: 'Materiály' },
  { href: '#kontakt', label: 'Kontakt' },
] as const;
