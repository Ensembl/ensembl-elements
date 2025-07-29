# Info on packaging

## Include assets
A distribution of reusable components should include not only the javascript files, but also:
- CSS files
- SVG files
- Font files
- Typescript definitions

## Building with Vite
- When building in library mode, for web components, there will be multiple entries (one per component)
  - We'll probably need to list the entry points manually, unless we come up with some naming convention for excluding helper files that should not be exposed as a public interface of the package 
- Remember to generate the `.d.ts` file

## Package.json fields

### The 'files' field
From the docs:

> The optional files field is an array of file patterns that describes the entries to be included when your package is installed as a dependency. File patterns follow a similar syntax to .gitignore, but reversed: including a file, directory, or glob pattern (*, **/*, and such) will make it so that file is included in the tarball when it's packed. Omitting the field will make it default to ["*"], which means it will include all files.

See examples:
- https://github.com/RedHat-UX/red-hat-design-system/blob/main/package.json#L46-L61

### The 'exports' field
From the docs:

> The "exports" provides a modern alternative to "main" allowing multiple entry points to be defined, conditional entry resolution support between environments, and preventing any other entry points besides those defined in "exports". This encapsulation allows module authors to clearly define the public interface for their package.

## Unresolved questions

### CSS
- Is the `sideEffects` field in `package.json` necessary? See
https://github.com/vitejs/vite/issues/1579#issuecomment-2526203989