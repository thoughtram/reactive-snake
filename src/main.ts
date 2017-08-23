import { Observable, BehaviorSubject, animationFrame } from './rxjs';
import { DIRECTIONS, SPEED, SNAKE_LENGTH, FPS, APPLE_COUNT, POINTS_PER_APPLE } from './constants';
import { Key, Point2D, Scene } from './types';

import {
  createCanvasElement,
  renderScene,
  renderApples,
  renderSnake,
  renderScore,
  renderGameOver,
  getRandomPosition,
  checkCollision
} from './canvas';

import {
  isGameOver,
  nextDirection,
  move,
  eat,
  generateSnake,
  generateApples
} from './utils';

/**
 * Create canvas element and append it to the page
 */
let canvas = createCanvasElement();
let ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

/**
 * Starting values
 */
const INITIAL_DIRECTION = DIRECTIONS[Key.RIGHT];

let ticks$ = Observable.interval(SPEED);

let click$ = Observable.fromEvent(document, 'click');
let keydown$ = Observable.fromEvent(document, 'keydown');

let direction$ = keydown$
  .map((event: KeyboardEvent) => DIRECTIONS[event.keyCode])
  .filter(direction => !!direction)
  .scan(nextDirection)
  .startWith(INITIAL_DIRECTION)
  .distinctUntilChanged();

let length$ = new BehaviorSubject<number>(SNAKE_LENGTH);

let snakeLength$ = length$
  .scan((step, snakeLength) => snakeLength + step)
  .share();

let score$ = snakeLength$
  .startWith(0)
  .scan((score, _) => score + POINTS_PER_APPLE);

let snake$: Observable<Array<Point2D>> = ticks$
  .withLatestFrom(direction$, snakeLength$, (_, direction, snakeLength) => [direction, snakeLength])
  .scan(move, generateSnake())
  .share();

let apples$ = snake$
  .scan(eat, generateApples())
  .distinctUntilChanged()
  .share();

let appleEaten$ = apples$
  .skip(1)
  .do(() => length$.next(POINTS_PER_APPLE))
  .subscribe();

let scene$ = Observable.combineLatest(snake$, apples$, score$, (snake, apples, score) => ({ snake, apples, score }));

let game$ = Observable.interval(1000 / FPS, animationFrame)
  .withLatestFrom(scene$, (_, scene) => scene)
  .takeWhile(scene => !isGameOver(scene))
  .subscribe({
    next: (scene) => renderScene(ctx, scene),
    complete: () => renderGameOver(ctx)
  });