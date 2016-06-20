
export default function track (name, props) {
  if (window.mixpanel)
    window.mixpanel.track(name, props)
  console.info('track', name, props)
}
