/**
 * Shell types supported for quoting and escaping
 */
export type ShellType = 'bash' | 'powershell' | 'cmd';

/**
 * Quote style options
 */
export type QuoteStyle = 'single' | 'double' | 'auto';

/**
 * Options for the quote function
 */
export interface QuoteOptions {
  /** The shell type to use for quoting */
  shell?: ShellType;
  /** The quote style to use */
  style?: QuoteStyle;
  /** Whether to force quoting even if not strictly necessary */
  force?: boolean;
}

/**
 * Escapes special characters in a string for bash shell
 * @param str - The string to escape
 * @param quoteStyle - The quote style to use
 * @returns The escaped and quoted string
 */
function escapeBash(str: string, quoteStyle: QuoteStyle = 'auto'): string {
  // If auto, determine best quote style
  if (quoteStyle === 'auto') {
    // Use single quotes if string doesn't contain them
    if (!str.includes("'")) {
      quoteStyle = 'single';
    }
    // Use double quotes if string doesn't contain them or $
    else if (!str.includes('"') && !str.includes('$')) {
      quoteStyle = 'double';
    }
    // Otherwise use double quotes with escaping
    else {
      quoteStyle = 'double';
    }
  }

  if (quoteStyle === 'single') {
    // Single quotes: everything is literal except single quote itself
    // To include a single quote, we end the single-quoted string,
    // add an escaped single quote, and start a new single-quoted string
    if (str.includes("'")) {
      const escaped = str.replace(/'/g, "'\\''");
      return `'${escaped}'`;
    }
    return `'${str}'`;
  } else {
    // Double quotes: escape special characters
    let escaped = str;
    // Escape backslashes first
    escaped = escaped.replace(/\\/g, '\\\\');
    // Escape double quotes
    escaped = escaped.replace(/"/g, '\\"');
    // Escape dollar signs (variable expansion)
    escaped = escaped.replace(/\$/g, '\\$');
    // Escape backticks (command substitution)
    escaped = escaped.replace(/`/g, '\\`');
    // Escape exclamation marks (history expansion in interactive shells)
    escaped = escaped.replace(/!/g, '\\!');
    return `"${escaped}"`;
  }
}

/**
 * Escapes special characters in a string for PowerShell
 * @param str - The string to escape
 * @param quoteStyle - The quote style to use
 * @returns The escaped and quoted string
 */
function escapePowerShell(str: string, quoteStyle: QuoteStyle = 'auto'): string {
  // If auto, determine best quote style
  if (quoteStyle === 'auto') {
    // Use single quotes if string doesn't contain them (single quotes are literal in PowerShell)
    if (!str.includes("'")) {
      quoteStyle = 'single';
    } else {
      quoteStyle = 'double';
    }
  }

  if (quoteStyle === 'single') {
    // Single quotes in PowerShell are literal (except for single quote itself)
    // To include a single quote, double it
    const escaped = str.replace(/'/g, "''");
    return `'${escaped}'`;
  } else {
    // Double quotes: escape special characters
    let escaped = str;
    // Escape backticks (escape character in PowerShell)
    escaped = escaped.replace(/`/g, '``');
    // Escape double quotes
    escaped = escaped.replace(/"/g, '""');
    // Escape dollar signs (variable expansion)
    escaped = escaped.replace(/\$/g, '`$');
    return `"${escaped}"`;
  }
}

/**
 * Escapes special characters in a string for Windows CMD
 * @param str - The string to escape
 * @param quoteStyle - The quote style to use
 * @returns The escaped and quoted string
 */
function escapeCmd(str: string, quoteStyle: QuoteStyle = 'auto'): string {
  // CMD primarily uses double quotes
  quoteStyle = quoteStyle === 'auto' ? 'double' : quoteStyle;

  let escaped = str;

  // Escape special CMD characters
  // Escape caret (escape character in CMD)
  escaped = escaped.replace(/\^/g, '^^');
  // Escape ampersand (command separator)
  escaped = escaped.replace(/&/g, '^&');
  // Escape pipe
  escaped = escaped.replace(/\|/g, '^|');
  // Escape redirect characters
  escaped = escaped.replace(/>/g, '^>');
  escaped = escaped.replace(/</g, '^<');
  // Escape percent signs (variable expansion)
  escaped = escaped.replace(/%/g, '%%');
  // Escape exclamation marks (if delayed expansion is enabled)
  escaped = escaped.replace(/!/g, '^!');

  // Wrap in double quotes
  return `"${escaped}"`;
}

/**
 * Quotes and escapes a string for the specified shell
 * @param str - The string to quote
 * @param options - Options for quoting
 * @returns The quoted and escaped string
 */
export function quote(str: string, options: QuoteOptions = {}): string {
  const { shell = 'bash', style = 'auto', force = false } = options;

  // Check if quoting is necessary
  if (!force) {
    // If string is empty or contains only safe characters, return as-is
    const safePattern = /^[a-zA-Z0-9_\-./:=]+$/;
    if (safePattern.test(str)) {
      return str;
    }
  }

  switch (shell) {
    case 'bash':
      return escapeBash(str, style);
    case 'powershell':
      return escapePowerShell(str, style);
    case 'cmd':
      return escapeCmd(str, style);
    default:
      throw new Error(`Unsupported shell type: ${shell}`);
  }
}

/**
 * Quotes an array of strings and joins them with spaces
 * @param args - Array of strings to quote
 * @param options - Options for quoting
 * @returns The quoted strings joined with spaces
 */
export function quoteArgs(args: string[], options: QuoteOptions = {}): string {
  return args.map(arg => quote(arg, options)).join(' ');
}

/**
 * Escapes a string for use in a bash shell (without adding quotes)
 * @param str - The string to escape
 * @returns The escaped string
 */
export function escapeBashRaw(str: string): string {
  let escaped = str;
  // Escape backslashes
  escaped = escaped.replace(/\\/g, '\\\\');
  // Escape spaces
  escaped = escaped.replace(/ /g, '\\ ');
  // Escape other special characters
  escaped = escaped.replace(/[&|;()<>$`"'\n\r!#~*?{}[\]]/g, '\\$&');
  return escaped;
}

/**
 * Escapes a string for use in a PowerShell shell (without adding quotes)
 * @param str - The string to escape
 * @returns The escaped string
 */
export function escapePowerShellRaw(str: string): string {
  let escaped = str;
  // Escape backticks
  escaped = escaped.replace(/`/g, '``');
  // Escape special characters
  escaped = escaped.replace(/[${}()"'|<>@&#;!]/g, '`$&');
  return escaped;
}

/**
 * Escapes a string for use in a Windows CMD shell (without adding quotes)
 * @param str - The string to escape
 * @returns The escaped string
 */
export function escapeCmdRaw(str: string): string {
  let escaped = str;
  // Escape caret
  escaped = escaped.replace(/\^/g, '^^');
  // Escape other special characters
  escaped = escaped.replace(/[&|<>%!()@"']/g, '^$&');
  return escaped;
}

/**
 * Escapes a string for the specified shell (without adding quotes)
 * @param str - The string to escape
 * @param shell - The shell type
 * @returns The escaped string
 */
export function escape(str: string, shell: ShellType = 'bash'): string {
  switch (shell) {
    case 'bash':
      return escapeBashRaw(str);
    case 'powershell':
      return escapePowerShellRaw(str);
    case 'cmd':
      return escapeCmdRaw(str);
    default:
      throw new Error(`Unsupported shell type: ${shell}`);
  }
}

// Default export for convenience
export default {
  quote,
  quoteArgs,
  escape,
};