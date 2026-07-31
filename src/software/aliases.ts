/**
 * Known OpenQase slug ↔ external slug mismatches (QOSF marketing names, etc.).
 * Keys and values are both slugify()'d forms.
 */
export const SOFTWARE_SLUG_ALIASES: Record<string, string> = {
  braket: 'amazon-braket-sdk',
  'amazon-braket': 'amazon-braket-sdk',
  ocean: 'dwave-ocean',
  'dwave-ocean-sdk': 'dwave-ocean',
  forest: 'pyquil',
  tket: 'pytket',
  strawberryfields: 'strawberry-fields',
}
