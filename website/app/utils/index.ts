import { getValue } from './get';

export function ensureLeadingSlash(path: string) {
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
}

const VARIABLE_REGEX = /{{\s([a-zA-Z0-9_.]*)\s}}/gm;

export function replaceVariables(variables: Record<string, string>, value: string) {
  let output = value;
  let m: RegExpExecArray | null;

  while ((m = VARIABLE_REGEX.exec(value)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === VARIABLE_REGEX.lastIndex) {
      VARIABLE_REGEX.lastIndex++;
    }

    output = output.replace(m[0], getValue(variables, m[1], ''));
  }

  return output;
}

export function hash(value: string): string {
  let hash = 0,
    i: number,
    chr: number;
  for (i = 0; i < value.length; i++) {
    chr = value.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
}