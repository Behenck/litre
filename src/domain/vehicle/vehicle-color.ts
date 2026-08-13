/**
 * Cores disponíveis para identificar o veículo na lista.
 *
 * Paleta transposta do modelo de layout (`design-model/Litro.dc.html`).
 */

export const VEHICLE_COLORS = [
  { hex: '#B8BDC4', name: 'Prata' },
  { hex: '#1A1D21', name: 'Preto' },
  { hex: '#F2F2EE', name: 'Branco' },
  { hex: '#C0392B', name: 'Vermelho' },
  { hex: '#1F5FA8', name: 'Azul' },
  { hex: '#2E7D5B', name: 'Verde' },
  { hex: '#D98A2B', name: 'Laranja' },
] as const;

export type VehicleColor = (typeof VEHICLE_COLORS)[number];

export const DEFAULT_COLOR: VehicleColor = VEHICLE_COLORS[0];

export function colorNameFor(hex: string): string {
  return VEHICLE_COLORS.find((color) => color.hex.toLowerCase() === hex.toLowerCase())?.name ?? 'Personalizada';
}

export function isKnownColor(hex: string): boolean {
  return VEHICLE_COLORS.some((color) => color.hex.toLowerCase() === hex.toLowerCase());
}
