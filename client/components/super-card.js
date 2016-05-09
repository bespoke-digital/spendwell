
import _ from 'lodash';
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

  const canExpand = !_.isUndefined(expanded) && _.any(children);

  return (
    <div {...childProps} className={`
      super-card
      ${styles.root}
      ${canExpand ? 'can-expand' : ''}
      ${canExpand && expanded ? 'expanded' : ''}
      ${className ? className : ''}
    `}>
      <div className='summary' onClick={onSummaryClick}>{summary}</div>
      {expanded ? children : null}
    </div>
  );
};
