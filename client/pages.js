
import $ from 'jquery';
import moment from 'moment-timezone';

import 'sass/pages';


$('.landing-cta').on('click', function(event) {
  event.preventDefault();

  window.mixpanel.track('Landing: CTA Clicked');
  window.fbq('track', 'Lead');

  const formContainer = document.getElementById('landing-form-container');
  formContainer.style.display = 'block';
  formContainer.onclick = ()=> formContainer.style.display = 'none';
});

const form = document.getElementById('landing-form');

if (form) {
  form.onclick = (event)=> event.stopPropagation();
  form.onsubmit = ()=> {
    window.mixpanel.track('Landing: Email Submitted');
    window.fbq('track', 'CompleteRegistration');
  };
}

$('input').on('change', function() {
  const $input = $(this);
  const value = $input.val();
  if (value && value.length)
    $input.addClass('mui--is-not-empty');
  else
    $input.removeClass('mui--is-not-empty');
});


if ($('#id_timezone'))
  $('#id_timezone').val(moment.tz.guess());
