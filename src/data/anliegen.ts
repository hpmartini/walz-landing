// Contact form topics (plan ch. 3) and the ?anliegen= values that preselect one.
export const ANLIEGEN = [
  'Gründung',
  'Nachfolge',
  'laufende Buchhaltung',
  'Lohnabrechnung',
  'Jahresabschluss',
  'Steuererklärung',
  'andere Frage',
] as const;

// Known URL values. '' = known but no matching option (e.g. erstgespraech): select stays empty.
export const ANLIEGEN_PARAM: Record<string, string> = {
  erstgespraech: '',
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
