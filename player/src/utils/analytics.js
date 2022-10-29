export default (action) => {
  window.gtag && gtag('event', action, { 'event_category': 'player' })
}