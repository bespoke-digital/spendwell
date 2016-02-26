
import _ from 'lodash';
import Transition from 'components/transition';
import styles from 'sass/components/super-card.scss';


export default (props)=> {
  const {
    expanded,
    className,
    summary,
    children,
    onSummaryClick,
    ...childProps,
  } = props;

  return (
    <div {...childProps} className={`
      super-card
      ${styles.root}
      ${!_.isUndefined(expanded) ? 'can-expand' : ''}
      ${expanded ? 'expanded' : ''}
      ${className ? className : ''}
    `}>
      <div className='summary' onClick={onSummaryClick}>{summary}</div>
      <Transition name='fade'>
        {expanded ? children : null}
      </Transition>
    </div>
  );
};
