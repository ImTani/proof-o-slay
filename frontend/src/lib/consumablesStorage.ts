export interface OwnedConsumable {
    id: string;
    purchaseDate: number;
}

const STORAGE_KEY = 'proof_o_slay_consumables';

export function getOwnedConsumables(): string[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    try {
        const data: OwnedConsumable[] = JSON.parse(stored);
        return data.map(c => c.id);
    } catch {
        return [];
    }
}

export function addOwnedConsumable(id: string): void {
    const current = getOwnedConsumables();
    if (current.includes(id)) return;

    const newItem: OwnedConsumable = {
        id,
        purchaseDate: Date.now()
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    const existing: OwnedConsumable[] = stored ? JSON.parse(stored) : [];
    existing.push(newItem);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function clearOwnedConsumables(): void {
    localStorage.removeItem(STORAGE_KEY);
}
