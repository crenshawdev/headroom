export function register(on, options) {
  on('session.measure', ($, e, next) => next(e))
}
