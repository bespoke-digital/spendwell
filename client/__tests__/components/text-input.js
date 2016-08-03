
jest.unmock('components/text-input')

import { shallow } from 'enzyme'
import TextInput from 'components/text-input'

describe('<TextInput/>', () => {
  it('should change values', () => {
    let passedValue
    const wrapper = shallow(<TextInput onChange={function (value) {
      passedValue = value
    }}/>)

    wrapper.find('input').simulate('change', { currentTarget: { value: 'filler' } })
    expect(passedValue).toBe('filler')
  })
})
