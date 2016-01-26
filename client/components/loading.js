
import { Component } from 'react';

import Card from 'components/card';

import style from 'sass/components/loading';


export default class Loading extends Component {
  render() {
    return (
      <Card className={style.root}>
        <i className='fa fa-spinner fa-spin'/>
      </Card>
    );
  }
}
