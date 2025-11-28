export interface SpriteComponent {
    texture: string;
    frame: string | number;
    flipX: boolean;
    rotation: number;
    animKey?: string;
}

export const createSpriteComponent = (
    texture: string,
    frame: string | number = 0,
    animKey?: string
): SpriteComponent => {
    return {
        texture,
        frame,
        flipX: false,
        rotation: 0,
        animKey,
    };
};
