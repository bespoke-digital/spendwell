
import $ from 'jquery';
import moment from 'moment-timezone';

import 'sass/pages';

const analyticsPageName = document.querySelector('meta[name=analytics-page-name]').getAttribute('content');
window.mixpanel.track(`Landing: ${analyticsPageName}`);


// needed for Kickoff Pages
window.jQuery = window.$kol_jquery = $;

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


// Facebook ad tracking
const facebookPixelKey = document.querySelector('meta[name=facebook-pixel-key]').getAttribute('content');

!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','//connect.facebook.net/en_US/fbevents.js');

fbq('init', facebookPixelKey);
fbq('track', 'PageView');
