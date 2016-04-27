
import { Component } from 'react';
import Relay from 'react-relay';
import { browserHistory } from 'react-router';

import { handleMutationError } from 'utils/network-layer';
import App from 'components/app';
import GoalForm from 'components/goal-form';
import { CreateGoalMutation } from 'mutations/goals';

import styles from 'sass/components/page-heading.scss';


export default function PageHeading({ className, ...props }) {
  return <div className={`${styles.root} ${className}`} {...props}/>;
}
