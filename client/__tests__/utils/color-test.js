
jest.unmock('utils/color')

import color from 'utils/color'

describe('color', function () {
  it('should resolve the default green', function () {
    expect(color('green')).toEqual('#4caf50')
  })

  it('resolve numbered pink', function () {
    expect(color('pink', '200')).toEqual('#f48fb1')
  })

  it('resolve integers', function () {
    expect(color('pink', 200)).toEqual('#f48fb1')
  })
})
