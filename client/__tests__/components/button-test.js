
jest.unmock('components/button')

import React from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-addons-test-utils'

import Button from 'components/button'

describe('<Button />', () => {
  it('should have preliminary class', () => {
    const component = TestUtils.renderIntoDocument(<Button />)
    const node = ReactDOM.findDOMNode(component)
    expect(node.classList.contains('mui-btn')).toEqual(true)
  })

  it('should not be a floating action button', () => {
    const component = TestUtils.renderIntoDocument(<Button />)
    const node = ReactDOM.findDOMNode(component)
    expect(node.classList.contains('fab')).toEqual(false)
  })
})

describe('<Button flat/>', () => {
  it('should NOT be a floating action button with flat style', () => {
    const component = TestUtils.renderIntoDocument(<Button flat/>)
    const node = ReactDOM.findDOMNode(component)
    expect(node.classList.contains('mui-btn--fab')).toEqual(false)
    expect(node.classList.contains('mui-btn--flat')).toEqual(true)
  })
})

describe('<Button fab/>', () => {
  it('should be a floating action button', () => {
    const component = TestUtils.renderIntoDocument(<Button fab/>)
    const node = ReactDOM.findDOMNode(component)
    expect(node.classList.contains('mui-btn--fab')).toEqual(true)
  })
})

describe('<Button fab plain/>', () => {
  it('should be a floating action button with plain style', () => {
    const component = TestUtils.renderIntoDocument(<Button fab plain/>)
    const node = ReactDOM.findDOMNode(component)
    expect(node.classList.contains('mui-btn--fab')).toEqual(true)
    expect(node.classList.contains('mui-btn--plain')).toEqual(true)
  })
})

describe('<Button fab disabled/>', () => {
  it('should be a floating action button with disabled style', () => {
    const component = TestUtils.renderIntoDocument(<Button fab disabled/>)
    const node = ReactDOM.findDOMNode(component)
    expect(node.classList.contains('mui-btn--fab')).toEqual(true)
    expect(node.classList.contains('mui--is-disabled')).toEqual(true)
  })
})

describe('<Button fab loading/>', () => {
  it('should be a floating action button with loading style', () => {
    const component = TestUtils.renderIntoDocument(<Button fab loading/>)
    const wrapper = ReactDOM.findDOMNode(component)
    expect(wrapper.classList.contains('mui-btn--fab')).toEqual(true)
    expect(wrapper.classList.contains('mui-btn--can-load')).toEqual(true)
    expect(wrapper.classList.contains('mui-btn--is-loading')).toEqual(true)
  })
})
