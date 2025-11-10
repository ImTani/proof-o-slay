/**
 * Collectible Component - Marks entity as collectible with a value
 */
export interface CollectibleComponent {
  type: 'shard';
  value: number;
}

export const createCollectibleComponent = (
  type: 'shard' = 'shard',
  value: number = 1
): CollectibleComponent => ({
  type,
  value,
});
