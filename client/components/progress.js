
import { Component, PropTypes } from 'react'

import style from 'sass/components/progress'


const percent = (v, t) => parseInt((Math.abs(v) / Math.abs(t)) * 100)


export default class Progress extends Component {
  static propTypes = {
    current: PropTypes.number,
    target: PropTypes.number,
    className: PropTypes.string,
    indeterminate: PropTypes.bool,
    marker: PropTypes.number,
    color: PropTypes.string,
  };

  static defaultProps = {
    current: 1,
    target: 100,
    className: '',
    indeterminate: false,
  };

  render () {
    const { current, target, marker, className, color, indeterminate } = this.props

    let progress = percent(current, target)
    const full = progress === 100
    const over = progress > 100

    if (over && progress <= 200)
      progress -= 100
    else if (over)
      progress = 100

    return (
      <div className={`
        progress
        ${className}
        ${style.root}
        ${!indeterminate && over ? 'progress-over' : ''}
        ${!indeterminate && full ? 'progress-full' : ''}
        ${color ? `progress-${color}` : ''}
        ${indeterminate ? 'progress-indeterminate' : ''}
      `}>
        <div className='bar' style={!indeterminate ? {
          width: `${progress === 100 ? 100 : progress % 100}%`,
        } : null}/>
        {!indeterminate && marker ?
          <div className='marker' style={{
            left: `${marker === 100 ? 100 : marker % 100}%`,
          }}/>
        : null}
      </div>
    )
  }
}
