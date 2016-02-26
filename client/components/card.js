
import _ from 'lodash';
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
      {canExpand && expanded ?
        <div className='expanded-content'>
          {children}
        </div>
      : !canExpand && children ?
        children
      : null}
    </div>
  );
};
