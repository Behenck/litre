/** As sete áreas do app, sempre acessíveis a partir do topo (FR-040). */
export const NAV_ITEMS = [
  { href: '/', label: 'Veículos' },
  { href: '/painel', label: 'Painel' },
  { href: '/abastecer', label: 'Abastecer' },
  { href: '/historico', label: 'Histórico' },
  { href: '/postos', label: 'Postos' },
  { href: '/comparativo', label: 'Etanol × Gasolina' },
  { href: '/ajustes', label: 'Ajustes' },
] as const;

/** Rotas que operam sobre o veículo em foco e por isso carregam `?veiculo=`. */
const VEHICLE_SCOPED = new Set<string>(['/painel', '/abastecer', '/historico', '/comparativo']);

export function isVehicleScoped(href: string): boolean {
  return VEHICLE_SCOPED.has(href);
}

/** Monta o href preservando o veículo selecionado quando a rota precisa dele. */
export function hrefWithVehicle(href: string, vehicleId: string | null): string {
  if (!vehicleId || !isVehicleScoped(href)) return href;
  return `${href}?veiculo=${encodeURIComponent(vehicleId)}`;
}
