import path from "path";

/**
 * Custom resolve function for the Nuxt environment
 * The right-most parameter is considered {to}. Other parameters are considered an array of {from}.
 *
 * Starting from leftmost {from} parameter, resolves {to} to an absolute path.
 *
 * If {to} isn't already absolute, {from} arguments are prepended in right to left order,
 * until an absolute path is found. If after using all {from} paths still no absolute path is found,
 * the current working directory is used as well. The resulting path is normalized,
 * and trailing slashes are removed unless the path gets resolved to the root directory.
 *
 * @param paths A sequence of paths or path segments.
 * @throws {TypeError} if any of the arguments is not a string.
 */
export default function resolve(...paths: string[]) {
  if (import.meta.env.NODE_ENV === "production") paths.unshift("..");
  return path.resolve(...paths);
}
