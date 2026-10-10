import { EMAIL, MAPS, PHONE } from './site';
import { asset } from './paths';

export const SITE_NAME = 'Kamenictví Smolík';
export const TITLE = 'Kamenictví Smolík – přírodní kámen na míru | Dub nad Moravou';
export const DESCRIPTION =
  'Stoly, kuchyňské desky, obklady, fasády a dlažby z přírodního kamene na míru. Pískovec, žula, mramor i břidlice. Kamenictví Smolík, Dub nad Moravou.';

export const ADDRESS = {
  street: 'Sokolská 317',
  postalCode: '783 75',
  locality: 'Dub nad Moravou',
  country: 'CZ',
};

/** Materiály, se kterými firma pracuje (z obsahu webu). */
const MATERIALS = ['Pískovec', 'Vápenec', 'Břidlice', 'Žula', 'Mramor', 'Andezit', 'Opuka', 'Porfyr', 'Travertin', 'Umělý kámen', 'Kamenné obklady', 'Kamenné dlažby'];

/**
 * Strukturovaná data schema.org (JSON-LD) pro vyhledávače a AI asistenty.
 * TODO po doplnění od klienta: openingHoursSpecification, geo (souřadnice), sameAs (Google profil, Firmy.cz), priceRange.
 */
export function structuredData(site: URL, ogImage: string) {
  const url = new URL(asset(''), site).href;
  const id = (frag: string) => `${url}#${frag}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HomeAndConstructionBusiness',
        '@id': id('firma'),
        name: SITE_NAME,
        description: DESCRIPTION,
        url,
        telephone: `+420 ${PHONE}`,
        email: EMAIL,
        image: ogImage,
        logo: new URL(asset('icon-512.png'), site).href,
        hasMap: MAPS,
        address: {
          '@type': 'PostalAddress',
          streetAddress: ADDRESS.street,
          postalCode: ADDRESS.postalCode,
          addressLocality: ADDRESS.locality,
          addressCountry: ADDRESS.country,
        },
        knowsAbout: MATERIALS,
        makesOffer: ['Stoly z přírodního kamene na míru', 'Kuchyňské desky z kamene', 'Kamenné obklady a fasády', 'Kamenné dlažby', 'Schodiště a parapety z kamene'].map((name) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name },
        })),
      },
      {
        '@type': 'WebSite',
        '@id': id('web'),
        url,
        name: SITE_NAME,
        inLanguage: 'cs-CZ',
        publisher: { '@id': id('firma') },
      },
      {
        '@type': 'WebPage',
        '@id': id('uvod'),
        url,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: 'cs-CZ',
        isPartOf: { '@id': id('web') },
        about: { '@id': id('firma') },
        primaryImageOfPage: ogImage,
      },
    ],
  };
}
