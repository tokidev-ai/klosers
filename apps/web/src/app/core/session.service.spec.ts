import { initialsOf } from './session.service';

describe('initialsOf', () => {
  it.each([
    ['Sofía Rojas', 'SR'],
    ['mariana.vaca@klosers.test', 'MV'],
    ['Camila', 'C'],
    ['', '?'],
  ])('turns %s into %s', (name, initials) => {
    expect(initialsOf(name)).toBe(initials);
  });
});
