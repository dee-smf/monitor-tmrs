export const REPORT_DESCRIPTIONS = {
    RESULT: {
        title: (year) => year
            ? `Resultado mensal — ${year}`
            : 'Resultado mensal — Todos os períodos',
        desc: (detailExpenses) => detailExpenses
            ? 'Comparação mensal entre Receita, Coleta, Aterro e Resultado.'
            : 'Comparação mensal entre Receita, Despesa e Resultado.',
    },
    ROLLING_12_PERIOD_SUM: {
        title: (year) => year
            ? `Resultado em 12 meses — ${year}`
            : 'Resultado em 12 meses — Todos os períodos',
        desc: (detailExpenses) => detailExpenses
            ? 'Evolução do Resultado em 12 meses, desagregando Coleta e Aterro.'
            : 'Evolução do Resultado em 12 meses, confrontando Receita e Despesa.',
    },
    CUM_SUM_BY_YEAR: {
        title: (year) => year
            ? `Acumulado no ano — ${year}`
            : 'Acumulado no ano — Todos os períodos',
        desc: (detailExpenses) => detailExpenses
            ? 'Evolução acumulada de Receita, Coleta e Aterro ao longo do ano.'
            : 'Evolução acumulada de Receita, Despesa e Resultado ao longo do ano.',
    },
};
