
import { expect } from 'chai';
import color from 'utils/color';

describe('color', function() {
  it('should resolve the default green', function() {
    expect(color('green')).to.equal('#4caf50');
  });
});
