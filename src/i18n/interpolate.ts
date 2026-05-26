export function interpolate<A extends Record<string, string | number>>(
  fn: (arg: A) => string,
  args: A,
): string {
  return fn(args)
}
