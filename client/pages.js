
import 'sass/pages';


const landingCta = document.getElementById('landing-cta');

if (landingCta) {
  landingCta.onclick = function(event) {
    window.mixpanel.track('Landing: CTA Clicked');
    console.log('click');

    event.preventDefault();

    const formContainer = document.getElementById('landing-form-container');
    const form = document.getElementById('landing-form');

    formContainer.style.display = 'block';

    formContainer.onclick = ()=> formContainer.style.display = 'none';
    form.onclick = (event)=> event.stopPropagation();
  };
}
