import { describe, it, expect } from 'vitest';
import { soapValue, bankRun } from './economy';
import { buildRunConfig } from '../skills/effects';
import { defaultSave } from '../save/storage';

describe('economy', () => {
  it('soap is worth 1 by default, 2 with soapX2', () => {
    expect(soapValue(buildRunConfig([]))).toBe(1);
    expect(soapValue(buildRunConfig(['soapX2']))).toBe(2);
  });

  it('banks run soap into total immutably', () => {
    const save = { ...defaultSave(), totalSoap: 10 };
    const after = bankRun(save, 7, 123.9);
    expect(after.totalSoap).toBe(17);
    expect(after.highScore).toBe(123);
    expect(save.totalSoap).toBe(10); // original untouched
  });

  it('only raises high score when beaten', () => {
    const save = { ...defaultSave(), highScore: 500 };
    expect(bankRun(save, 0, 200).highScore).toBe(500);
    expect(bankRun(save, 0, 600).highScore).toBe(600);
  });
});
