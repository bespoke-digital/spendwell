import React from 'react'

import style from 'sass/components/card-grid'

export default class CardGrid extends React.Component {
  render() {
    return (
      <div className={style.root}>
        {this.props.children}
      </div>
    )
  }
}
