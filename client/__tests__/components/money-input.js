
jest.unmock('components/money-input')

import { shallow } from 'enzyme'
import MoneyInput from 'components/money-input'

describe('<MoneyInput/>', () => {
  it('should allow typing decimal places', () => {
    let outputValue
    const wrapper = shallow(<MoneyInput
      initialValue={400}
      onChange={function (value) {
        outputValue = value
      }}
    />)

    wrapper.simulate('change', 'somecrap')
    expect(wrapper.state('value')).toBe('somecrap')
    expect(wrapper.state('valid')).toBe(false)
    expect(outputValue).toBeUndefined()

    wrapper.simulate('change', '23.')
    expect(wrapper.state('value')).toBe('23.')
    expect(wrapper.state('valid')).toBe(true)
    expect(outputValue).toBe(2300)

    wrapper.simulate('change', '23.1')
    expect(wrapper.state('value')).toBe('23.1')
    expect(wrapper.state('valid')).toBe(true)
    expect(outputValue).toBe(2310)

    wrapper.simulate('change', '')
    expect(wrapper.state('value')).toBe('')
    expect(wrapper.state('valid')).toBe(false)
    expect(outputValue).toBe(2310)
  })
})
