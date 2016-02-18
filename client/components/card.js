
import _ from 'lodash';
import Transition from 'components/transition';
import styles from 'sass/components/card.scss';


export default (props)=> {
  const {
      expanded,
      className,
      summary,
      children,
      onSummaryClick,
      ...childProps,
  } = props;
  const canExpand = !_.isUndefined(expanded);
  return (
    <div {...childProps} className={`
      card
      ${styles.root}
      ${canExpand ? 'can-expand' : ''}
      ${expanded ? 'expanded' : ''}
      ${className ? className : ''}
    `}>
      {summary ?
        <div className='summary' onClick={onSummaryClick}>{summary}</div>
      : null}
      {canExpand ?
        <Transition name='children'>{expanded ? (
          <div className='expanded-content'>
            {children}
          </div>
        ) : null}</Transition>
      :
        children
      }
    </div>
  );
};
