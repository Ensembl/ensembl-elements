# Useful examples of design systems

## Red Hat's Design System
- Has a branded part (RedHat design system, or RHDS), and a generic part (PatternFly)
  - RedHat design system [documentation site](https://ux.redhat.com/) and [repo](https://github.com/RedHat-UX/red-hat-design-system)
  - PatternFly [documentation site](https://patternflyelements.org/) and [repo](https://github.com/patternfly/patternfly-elements)
- Is very thorough
- Uses web components with Lit
- Uses typescript
- Has a custom-made documentation/demo site, built with Eleventy
- Seems to use 'subpath imports' in package.json
  - Example: https://github.com/RedHat-UX/red-hat-design-system/blob/da05c0d48a706128625d0370fc8fa8baaae1353e/package.json#L20-L26
  - Node docs: https://nodejs.org/api/packages.html#subpath-imports
  - A blog article discussing this: https://webpro.nl/articles/using-subpath-imports-and-path-aliases

## Material Web
- [Documentation site](https://material-web.dev/); [repo](https://github.com/material-components/material-web)
- Built by Google using web components with Lit, and typescript
- Practically abandoned as a result of Google's internal politics and layoffs
- Very high quality
- Has a custom-made documentation/demo site, built with Eleventy
- See how they delegate aria attributes from the custom element to the native component: https://github.com/material-components/material-web/blob/main/internal/aria/delegate.ts

## Adobe Spectrum
- [Documentation site](https://opensource.adobe.com/spectrum-web-components/); [components playground](https://opensource.adobe.com/spectrum-web-components/storybook/index.html); [repo](https://github.com/adobe/spectrum-web-components)
- Very high quality
- Uses web components and typescript
- Structures the repository as a monorepo
- Uses Storybook for demo/playground

## Shoelace (rebranded as WebAwesome)
- [Shoelace documentation site](https://shoelace.style/); [WebAwesome documentation site](https://webawesome.com/); [repository](https://github.com/shoelace-style/webawesome)
- Most of it is open-source; but parts are closed-source
- Very high quality
- Uses web components with Lit, and typescript
- Has a custom-made documentation/demo site, built with Eleventy

## Quiet
- [Github repository](https://github.com/quietui/quiet)
- Another project by the creator of Shoelace
- Uses web components with Lit
- Uses an Eleventy-based playground / docs site

## Nord Design System
- [Documentation site](https://nordhealth.design/)
- Closed-source; but the build can be accessed over npm (e.g. [@nordhealth/components](https://www.npmjs.com/package/@nordhealth/components)); and the components can be inspected on the documentation site
- The documentation / demo site is masterfully built with Eleventy; but since it is closed-source, it is impossible to inspect how they did this

## Lion, by ING bank
- [Documentation site](https://lion.js.org/) and [repository](https://github.com/ing-bank/lion)
- Made of web components; uses Lit and typescript
- Has a custom demo site built with Eleventy

## Momentum Design
- [docs site](https://momentum-design.github.io/momentum-design/en/) and the [github repo](https://github.com/momentum-design/momentum-design)
- Built with Lit
- Uses Storybook

## PIE Web Components, by Just Eat Takeaway
- [Link to documentation site](https://webc.pie.design/?path=/docs/introduction-getting-started--docs); [link to repo](https://github.com/justeattakeaway/pie)
- Has various implementations of the design system, one of which is built on top of web components
- Uses off-the-shelf tools: turborepo for monorepo management; Storybook for documentation/demo/playground site
