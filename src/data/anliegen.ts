// Contact form topics (plan ch. 3) and the ?anliegen= values that preselect one.
export const ANLIEGEN = [
  'Erstgespräch / allgemeine Anfrage',
  'Gründung',
  'Nachfolge',
  'laufende Buchhaltung',
  'Lohnabrechnung',
  'Jahresabschluss',
  'Steuererklärung',
  'andere Frage',
] as const;

// Known URL values; erstgespraech is the hero CTA (audit V2 9.7).
export const ANLIEGEN_PARAM: Record<string, string> = {
  erstgespraech: 'Erstgespräch / allgemeine Anfrage',
  gruendung: 'Gründung',
  nachfolge: 'Nachfolge',
  buchhaltung: 'laufende Buchhaltung',
  lohn: 'Lohnabrechnung',
  jahresabschluss: 'Jahresabschluss',
  steuererklaerung: 'Steuererklärung',
  coaching: 'andere Frage',
  bwl: 'andere Frage',
  steuerberatung: 'andere Frage',
};

// Unknown or hostile values yield ''; the result is only ever used to pick an existing <option>.
export const anliegenFromParam = (value: string | null): string =>
  value && Object.hasOwn(ANLIEGEN_PARAM, value) ? ANLIEGEN_PARAM[value] : '';

export const isAnliegen = (value: string): boolean => (ANLIEGEN as readonly string[]).includes(value);
