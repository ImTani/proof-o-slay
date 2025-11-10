/**
 * Health Component - Manages entity health and invincibility
 */
export interface HealthComponent {
  current: number;
  max: number;
  isInvincible: boolean;
  invincibilityEndTime: number;
}

export const createHealthComponent = (max: number): HealthComponent => ({
  current: max,
  max,
  isInvincible: false,
  invincibilityEndTime: 0,
});
