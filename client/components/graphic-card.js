
import Card from 'components/card';
import FAIcon from 'components/fa-icon';
import A from 'components/a';

import styles from 'sass/components/graphic-card.scss';


export default (props)=> {
  const {
      scheme,
      image,
      header,
      paragraphs,
      dismiss,
  } = props;

  return (
    <Card className={`${styles.root} scheme-${scheme}`}>
      <div className='image'>
        <img src={image}/>
      </div>

      <div className='copy'>
        {header ? <h3>{header}</h3> : null}
        {paragraphs ? paragraphs : null}
      </div>

      {dismiss ?
        <div className='dismiss'>
          <A onClick={dismiss}><FAIcon type='times'/></A>
        </div>
      : null}
    </Card>
  );
};
