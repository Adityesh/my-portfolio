/**
 * How far open the door actually is right now (0 = shut, 1 = fully open), written by Door each frame and read by
 * Hallway, so the glow and spill light follow the leaf exactly instead of easing on their own (they used to lag
 * behind a closing door and light it up as it shut).
 */
export const doorMotion = { level: 0 }
