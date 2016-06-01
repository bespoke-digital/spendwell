
import $ from 'jquery';

$('.landing-cta').on('click', function(event) {
  event.preventDefault();

  window.mixpanel.track('Landing: CTA Clicked');
  window.fbq('track', 'Lead');

  $('#landing-form-container').show().on('click', function() {
    $(this).hide();
  });
});

const $form = $('#landing-form');
$form.on('click', (event)=> event.stopPropagation());
$form.on('submit', (event)=> {
  event.preventDefault();

  window.mixpanel.track('Landing: Email Submitted');
  window.fbq('track', 'CompleteRegistration');

  $.post('/beta-signup', $form.serialize(), ()=> {
    $('.email-form-success').show();
    $form.hide();
  });
});
