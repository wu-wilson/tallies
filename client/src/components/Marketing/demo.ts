import type { Person } from '../../types/bill';

/** The four friends the landing demos split a dinner between. */
export const DEMO_PEOPLE: Record<'alex' | 'jordan' | 'priya' | 'sam', Person> = {
  alex: { id: 'alex', name: 'Alex', color: 'slate' },
  jordan: { id: 'jordan', name: 'Jordan', color: 'gold' },
  priya: { id: 'priya', name: 'Priya', color: 'plum' },
  sam: { id: 'sam', name: 'Sam', color: 'sage' },
};

const { alex, jordan, priya, sam } = DEMO_PEOPLE;

/** Lines of the demo's Sushi Ran receipt, with who shared each. */
export const DEMO_ITEMS: { name: string; people: Person[]; price: string }[] = [
  { name: 'Omakase for two', people: [alex, jordan], price: '96.00' },
  { name: 'Spicy tuna roll', people: [priya], price: '14.50' },
  { name: 'Edamame', people: [alex, jordan, priya, sam], price: '6.00' },
  { name: 'Sake flight', people: [alex, sam], price: '24.00' },
];

/** Everyone's share of the demo bill, which adds up to $244.48. */
export const DEMO_SHARES: { person: Person; amount: string }[] = [
  { person: alex, amount: '$92.48' },
  { person: jordan, amount: '$75.84' },
  { person: priya, amount: '$49.60' },
  { person: sam, amount: '$26.56' },
];
