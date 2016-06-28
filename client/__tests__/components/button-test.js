
jest.unmock('components/button')

import React from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-addons-test-utils'

import Button from 'components/button'

describe('<Button />', () => {
  it('should have preliminary class', () => {
    const node = TestUtils.renderIntoDocument(<Button />)
    const wrapper = ReactDOM.findDOMNode(node)
    expect(wrapper.hasClass('mui-btn')).toEqual(true)
  })

  it('should not be a floating action button', () => {
    const node = TestUtils.renderIntoDocument(<Button />)
    const wrapper = ReactDOM.findDOMNode(node)
    expect(wrapper.hasClass('fab')).toEqual(false)
  })
})

describe('<Button flat/>', () => {
  it('should NOT be a floating action button with flat style', () => {
    const node = TestUtils.renderIntoDocument(<Button flat/>)
    const wrapper = ReactDOM.findDOMNode(node)
    expect(wrapper.hasClass('mui-btn--fab')).toEqual(false)
    expect(wrapper.hasClass('mui-btn--flat')).toEqual(true)
  })
})

describe('<Button fab/>', () => {
  it('should be a floating action button', () => {
    const node = TestUtils.renderIntoDocument(<Button fab/>)
    const wrapper = ReactDOM.findDOMNode(node)
    expect(wrapper.hasClass('mui-btn--fab')).toEqual(true)
  })
})

describe('<Button fab plain/>', () => {
  it('should be a floating action button with plain style', () => {
    const node = TestUtils.renderIntoDocument(<Button fab plain/>)
    const wrapper = ReactDOM.findDOMNode(node)
    expect(wrapper.hasClass('mui-btn--fab')).toEqual(true)
    expect(wrapper.hasClass('mui-btn--plain')).toEqual(true)
  })
})

describe('<Button fab disabled/>', () => {
  it('should be a floating action button with disabled style', () => {
    const node = TestUtils.renderIntoDocument(<Button fab disabled/>)
    const wrapper = ReactDOM.findDOMNode(node)
    expect(wrapper.hasClass('mui-btn--fab')).toEqual(true)
    expect(wrapper.hasClass('mui--is-disabled')).toEqual(true)
  })
})

describe('<Button fab loading/>', () => {
  it('should be a floating action button with loading style', () => {
    const node = TestUtils.renderIntoDocument(<Button fab loading/>)
    const wrapper = ReactDOM.findDOMNode(node)
    expect(wrapper.hasClass('mui-btn--fab')).toEqual(true)
    expect(wrapper.hasClass('mui-btn--can-load')).toEqual(true)
    expect(wrapper.hasClass('mui-btn--is-loading')).toEqual(true)
  })
})
