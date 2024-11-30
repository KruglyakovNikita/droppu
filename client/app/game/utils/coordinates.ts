export function getCoordinates(point: { x: number; y: number }): {
  x: number;
  y: number;
} {
  // Assuming your game width and height are 600 and 400 respectively
  const gameWidth = 600;
  const gameHeight = 400;

  return {
    x: point.x / gameWidth,
    y: point.y / gameHeight,
  };
}
