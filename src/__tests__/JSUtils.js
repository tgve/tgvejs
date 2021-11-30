import {randomToNumber} from '../utils/JSUtils'

test("randomToNumber", () => {
  expect(randomToNumber(null)).toEqual(0)
  expect(randomToNumber({})).toEqual(0)
  const n = 10;
  const r = randomToNumber(n);
  expect(r >= 0 && r < n).toBe(true)
})