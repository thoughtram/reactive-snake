import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { animationFrame } from 'rxjs/scheduler/animationFrame';

import { interval } from 'rxjs/observable/interval';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { combineLatest } from 'rxjs/observable/combineLatest';

import {
  map,
  filter,
  scan,
  startWith,
  distinctUntilChanged,
  share,
  withLatestFrom,
  tap,
  skip,
  takeWhile
} from 'rxjs/operators';

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

let ticks$ = interval(SPEED);

let click$ = fromEvent(document, 'click');
let keydown$ = fromEvent(document, 'keydown');

let direction$ = keydown$.pipe(
  map((event: KeyboardEvent) => DIRECTIONS[event.keyCode]),
  filter(direction => !!direction),
  startWith(INITIAL_DIRECTION),
  scan(nextDirection),
  distinctUntilChanged()
);

let length$ = new BehaviorSubject<number>(SNAKE_LENGTH);

let snakeLength$ = length$.pipe(
  scan((step, snakeLength) => snakeLength + step),
  share()
);

let score$ = snakeLength$.pipe(
  startWith(0),
  scan((score, _) => score + POINTS_PER_APPLE),
);

let snake$: Observable<Array<Point2D>> = ticks$.pipe(
  withLatestFrom(direction$, snakeLength$, (_, direction, snakeLength) => [direction, snakeLength]),
  scan(move, generateSnake()),
  share()
);

let apples$ = snake$.pipe(
  scan(eat, generateApples()),
  distinctUntilChanged(),
  share()
);

let appleEaten$ = apples$.pipe(
  skip(1),
  tap(() => length$.next(POINTS_PER_APPLE))
).subscribe();

let scene$: Observable<Scene> = combineLatest(snake$, apples$, score$, (snake, apples, score) => ({ snake, apples, score }));

let game$ = interval(1000 / FPS, animationFrame).pipe(
  withLatestFrom(scene$, (_, scene) => scene),
  takeWhile(scene => !isGameOver(scene))
).subscribe({
  next: (scene) => renderScene(ctx, scene),
  complete: () => renderGameOver(ctx)
});