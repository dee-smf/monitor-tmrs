const FIELD_LABELS = {
  period: 'Período',
  expenses: 'Despesas',
  revenues: 'Receitas',
  result: 'Resultado',
};

export function labelForKey(key) {
  return FIELD_LABELS[key] ?? key;
}
