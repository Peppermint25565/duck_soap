export interface Input {
  jumpPressed: boolean;
  duckHeld: boolean;
  downPressed: boolean;
  ability: { z: boolean; x: boolean; c: boolean };
  restart: boolean;
}

export function createInput(target: Window): { state: Input; clearEdges(): void; detach(): void } {
  const state: Input = {
    jumpPressed: false,
    duckHeld: false,
    downPressed: false,
    ability: { z: false, x: false, c: false },
    restart: false,
  };

  const onDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'Space':
      case 'ArrowUp':
        state.jumpPressed = true;
        e.preventDefault();
        break;
      case 'ArrowDown':
        state.duckHeld = true;
        state.downPressed = true;
        e.preventDefault();
        break;
      case 'KeyZ': state.ability.z = true; break;
      case 'KeyX': state.ability.x = true; break;
      case 'KeyC': state.ability.c = true; break;
      case 'Enter': state.restart = true; break;
    }
  };

  const onUp = (e: KeyboardEvent) => {
    if (e.code === 'ArrowDown') state.duckHeld = false;
  };

  target.addEventListener('keydown', onDown);
  target.addEventListener('keyup', onUp);

  return {
    state,
    clearEdges() {
      state.jumpPressed = false;
      state.downPressed = false;
      state.restart = false;
      state.ability = { z: false, x: false, c: false };
    },
    detach() {
      target.removeEventListener('keydown', onDown);
      target.removeEventListener('keyup', onUp);
    },
  };
}
