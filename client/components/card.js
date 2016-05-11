
import _ from 'lodash';
import { Component } from 'react';

import Progress from 'components/progress';

import styles from 'sass/components/card.scss';


export default class Card extends Component {
  render() {
    const {
        expanded,
        className,
        loading,
        summary,
        children,
        onSummaryClick,
        ...childProps,
    } = this.props;

    const canExpand = !_.isUndefined(expanded);

    return (
      <div {...childProps} className={`
        card
        ${styles.root}
        ${canExpand ? 'can-expand' : ''}
        ${expanded ? 'expanded' : ''}
        ${loading ? 'loading' : ''}
        ${className ? className : ''}
      `}>
        {summary ?
          <div className='summary' onClick={onSummaryClick}>{summary}</div>
        : null}

        {canExpand && expanded ?
          <div className='expanded-content'>
            {children}
          </div>
        : !canExpand && children ?
          children
        : null}

        {loading ?
          <Progress className='card-progress' indeterminate/>
        : null}
      </div>
    );
  }
}
