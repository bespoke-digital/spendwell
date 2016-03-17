
import $ from 'jquery';

import 'sass/pages';


const landingCta = document.getElementById('landing-cta');

if (landingCta) {
  landingCta.onclick = function(event) {
    event.preventDefault();

    window.mixpanel.track('Landing: CTA Clicked');
    window.fbq('track', 'Lead');

    const formContainer = document.getElementById('landing-form-container');
    formContainer.style.display = 'block';
    formContainer.onclick = ()=> formContainer.style.display = 'none';
  };
}

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
