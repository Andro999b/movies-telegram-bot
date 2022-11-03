export default (action: string): void => {
  // @ts-ignore
  window.gtag && gtag('event', action, { 'event_category': 'player' })
}