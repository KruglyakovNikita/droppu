export function getYPositionForPreset(
  position: "top" | "middle" | "bottom",
  gameHeight: number
): number {
  switch (position) {
    case "top":
      return gameHeight * 0.1;
    case "middle":
      return gameHeight * 0.5;
    case "bottom":
      return gameHeight * 0.9;
    default:
      return gameHeight * 0.5;
  }
}
