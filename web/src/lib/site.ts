/**
 * Kontaktní údaje – telefon je hlavní konverze webu.
 * Každý odkaz na TEL musí obsahovat číslo jako text (klidně vizuálně skryté, .sr-only): Safari na iOS jinak
 * klepnutí na odkaz bez čísla blokuje hláškou „Automatické zahajování hovorů z této stránky bylo zablokováno“.
 */
export const PHONE = '606 923 347';
export const TEL = 'tel:+420606923347';
export const EMAIL = 'smolik.jarda@volny.cz';
// sklad: špendlík přesně na místě (odkaz od klienta, 49°29'04.1"N 17°17'04.6"E)
export const MAPS = "https://www.google.com/maps/place/49%C2%B029'04.1%22N+17%C2%B017'04.6%22E/@49.4844837,17.2820477,17z/data=!3m1!4b1!4m4!3m3!8m2!3d49.4844837!4d17.2846226!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MTAxMS4wIKXMDSoASAFQAw%3D%3D";

export const NAV = [
  { href: '#postup', label: 'Postup' },
  { href: '#realizace', label: 'Realizace' },
  { href: '#materialy', label: 'Materiály' },
  { href: '#kontakt', label: 'Kontakt' },
] as const;
