export function register(on, options) {
  // Next fill that earns a reminder; plain variable so a reload starts over.
  let nextPoint = options.firstPoint

  on('session.measure', ($, e, next) => {
    const percent = e.context.percent

    if (typeof percent === 'number' && percent >= nextPoint) {
      $.ui.toast(`Context is ${percent}% full. Consider /clear to start fresh.`, {
        timeoutMs: options.toastSeconds * 1000,
      })
      nextPoint = percent + options.step
    }

    return next(e)
  })
}
