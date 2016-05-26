
import $ from 'jquery';

$('.landing-cta').on('click', function(event) {
  event.preventDefault();

  window.mixpanel.track('Landing: CTA Clicked');
  window.fbq('track', 'Lead');

  const formContainer = document.getElementById('landing-form-container');
  formContainer.style.display = 'block';
  formContainer.onclick = ()=> formContainer.style.display = 'none';
});

const $form = $('#landing-form');

if ($form) {
  $form.on('click', (event)=> event.stopPropagation());
  $form.on('submit', (event)=> {
    event.preventDefault();

    window.mixpanel.track('Landing: Email Submitted');
    window.fbq('track', 'CompleteRegistration');

    $.ajax({
      url: $form.attr('action'),
      data: $form.serialize(),
      dataType: 'jsonp',
      jsonp: 'jsonp',
      timeout: 2000,
      success: (data)=> document.location = data.social_url,
    });
  });
}
