import { Scene, Point2D } from './types';
import { checkCollision, getRandomPosition } from './canvas';
import { SNAKE_LENGTH, APPLE_COUNT } from './constants';

export function isGameOver(scene: Scene) {
  let snake = scene.snake;
  let head = snake[0];
  let body = snake.slice(1, snake.length);

  return body.some(segment => checkCollision(segment, head));
}

export function nextDirection(previous, next) {
  let isOpposite = (previous: Point2D, next: Point2D) => {
    return next.x === previous.x * -1 || next.y === previous.y * -1;
  };

  if (isOpposite(previous, next)) {
    return previous;
  }

  return next;
}

export function move(snake, [direction, snakeLength]) {
  let nx = snake[0].x;
  let ny = snake[0].y;

  nx += 1 * direction.x;
  ny += 1 * direction.y;

  let tail;

  if (snakeLength > snake.length) {
    tail = { x: nx, y: ny };
  } else {
    tail = snake.pop();
    tail.x = nx;
    tail.y = ny;
  }

  snake.unshift(tail);

  return snake;
}

export function eat(apples: Array<Point2D>, snake) {
  let head = snake[0];

  for (let i = 0; i < apples.length; i++) {
    if (checkCollision(apples[i], head)) {
      apples.splice(i, 1);
      return [...apples, getRandomPosition(snake)];
    }
  }

  return apples;
}

export function generateSnake() {
  let snake: Array<Point2D> = [];

  for (let i = SNAKE_LENGTH - 1; i >= 0; i--) {
    snake.push({ x: i, y: 0 });
  }

  return snake;
}

export function generateApples(): Array<Point2D> {
  let apples = [];

  for (let i = 0; i < APPLE_COUNT; i++) {
    apples.push(getRandomPosition());
  }

  return apples;
}