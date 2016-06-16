
import $ from 'jquery'
import moment from 'moment-timezone'

import 'sass/pages'
import 'utils/landing-email-form'

const analyticsPageName = document.querySelector('meta[name=analytics-page-name]').getAttribute('content')
if(window.mixpanel){
  window.mixpanel.track(`Landing: ${analyticsPageName}`)
}


$('input').on('change', function () {
  const $input = $(this)
  const value = $input.val()
  if (value && value.length)
    $input.addClass('mui--is-not-empty')
  else
    $input.removeClass('mui--is-not-empty')
})


if ($('#id_timezone'))
  $('#id_timezone').val(moment.tz.guess())


// Facebook ad tracking
const facebookPixelKey = document.querySelector('meta[name=facebook-pixel-key]').getAttribute('content')

!function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ?
n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq)f._fbq = n
  n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0
  t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window,
document, 'script', '//connect.facebook.net/en_US/fbevents.js')

fbq('init', facebookPixelKey)
fbq('track', 'PageView')
