export function formatDate(ms) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(ms);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
