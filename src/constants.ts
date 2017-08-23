import { Directions } from './types';

export const SNAKE_LENGTH = 5;

export const APPLE_COUNT = 2;
export const POINTS_PER_APPLE = 1;

export const SPEED = 200;
export const FPS = 60;

export const DIRECTIONS: Directions = {
  37: { x: -1, y: 0 },
  39: { x: 1, y: 0 },
  38: { x: 0, y: -1 },
  40: { x: 0, y: 1 }
};