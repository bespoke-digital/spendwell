
import { expect } from 'chai'
import color from 'utils/color'

describe('color', function () {
  it('should resolve the default green', function () {
    expect(color('green')).to.equal('#4caf50')
  })

  it('resolve numbered pink', function () {
    expect(color('pink', '200')).to.equal('#f48fb1')
  })

  it('resolve integers', function () {
    expect(color('pink', 200)).to.equal('#f48fb1')
  })
})
