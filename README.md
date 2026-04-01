# shell-quote-escape

A TypeScript library for quoting and escaping strings for bash, PowerShell, and Windows CMD shells.

## Installation

```bash
npm install shell-quote-escape
```

## Usage

This package supports ES modules and can be imported using the `import` syntax:

```typescript
import { quote, quoteArgs, escape } from 'shell-quote-escape';
```

## API

### `quote(str, options?)`

Quotes and escapes a string for the specified shell.

**Parameters:**
- `str` (string): The string to quote
- `options` (object, optional):
  - `shell` ('bash' | 'powershell' | 'cmd'): The shell type (default: 'bash')
  - `style` ('single' | 'double' | 'auto'): The quote style (default: 'auto')
  - `force` (boolean): Force quoting even if not necessary (default: false)

**Returns:** The quoted and escaped string

**Example:**
```typescript
import { quote } from 'shell-quote-escape';

// Bash
quote('hello world');                    // 'hello world'
quote("it's a test");                    // "it's a test"
quote('file$HOME');                      // 'file$HOME'

// PowerShell
quote('hello world', { shell: 'powershell' });  // 'hello world'
quote("it's", { shell: 'powershell' });         // "it's"

// CMD
quote('hello world', { shell: 'cmd' });  // "hello world"
quote('foo&bar', { shell: 'cmd' });      // "foo^&bar"
```

### `quoteArgs(args, options?)`

Quotes an array of strings and joins them with spaces.

**Parameters:**
- `args` (string[]): Array of strings to quote
- `options` (object, optional): Same as `quote` options

**Returns:** The quoted strings joined with spaces

**Example:**
```typescript
import { quoteArgs } from 'shell-quote-escape';

quoteArgs(['echo', 'hello world', 'file$HOME']);
// echo 'hello world' 'file$HOME'
```

### `escape(str, shell?)`

Escapes a string for the specified shell without adding quotes.

**Parameters:**
- `str` (string): The string to escape
- `shell` ('bash' | 'powershell' | 'cmd'): The shell type (default: 'bash')

**Returns:** The escaped string

**Example:**
```typescript
import { escape } from 'shell-quote-escape';

escape('hello world');                    // hello\ world
escape('hello world', 'powershell');      // hello world
escape('hello & world', 'cmd');           // hello ^& world
```

## Shell Types

### Bash
- Uses single quotes by default (everything is literal except single quote itself)
- For strings containing single quotes, uses double quotes with escaping
- Escapes: `\`, `"`, `$`, `` ` ``, `!`

### PowerShell
- Uses single quotes by default (literal strings)
- For strings containing single quotes, uses double quotes with escaping
- Escapes: `` ` ``, `"`, `$`

### CMD
- Uses double quotes
- Escapes: `^`, `&`, `|`, `>`, `<`, `%`, `!`

## License

ISC