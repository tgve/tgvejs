import {randomToNumber} from '../JSUtils'

test("randomToNumber", () => {
  expect(randomToNumber(null)).toEqual(0)
  expect(randomToNumber({})).toEqual(NaN)
  const n = 10;
  const r = randomToNumber(n);
  expect(r >= 0 && r < n).toBe(true)
})