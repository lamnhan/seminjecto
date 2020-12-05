<section id="head" data-note="AUTO-GENERATED CONTENT, DO NOT EDIT DIRECTLY!">

# @lamnhan/seminjecto

**Simple dependency injection for Typescript modules.**

</section>

<section id="header">

[![License][license_badge]][license_url]
[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)
[![Support me on Patreon][patreon_badge]][patreon_url]
[![PayPal][paypal_donate_badge]][paypal_donate_url]
[![Ask me anything][ask_me_badge]][ask_me_url]

[license_badge]: https://img.shields.io/github/license/mashape/apistatus.svg
[license_url]: https://github.com/lamnhan/seminjecto/blob/master/LICENSE
[patreon_badge]: https://lamnhan.github.io/assets/images/badges/patreon.svg
[patreon_url]: https://www.patreon.com/lamnhan
[paypal_donate_badge]: https://lamnhan.github.io/assets/images/badges/paypal_donate.svg
[paypal_donate_url]: https://www.paypal.me/lamnhan
[ask_me_badge]: https://img.shields.io/badge/ask/me-anything-1abc9c.svg
[ask_me_url]: https://m.me/lamhiennhan

</section>

<section id="tocx" data-note="AUTO-GENERATED CONTENT, DO NOT EDIT DIRECTLY!">

- [Introduction](#introduction)
- [Benefits](#benefits)
- [Installation](#installation)
- [Skeletons](#skeletons)
- [Convention](#convention)
  - [Helpers](#helpers)
    - [VSCode](#vscode)
    - [GIT](#git)
    - [Linter/prettier](#linter-prettier)
    - [Documentation](#documentation)
    - [Testing](#testing)
    - [Continuous integration](#continuous-integration)
    - [Vendor code](#vendor-code)
    - [Special deployment](#special-deployment)
  - [Project types](#project-types)
    - [Library](#library)
    - [CLI](#cli)
    - [Express](#express)
    - [Sheetbase](#sheetbase)
    - [Workspace](#workspace)
- [Command overview](#cli-command-overview)
- [Command reference](#cli-command-reference)
  - [`clean`](#command-clean)
  - [`generate`](#command-generate)
  - [`new`](#command-new)
  - [`help`](#command-help)
  - [`*`](#command-*)
- [Detail API reference](https://lamnhan.com/seminjecto)


</section>

<section id="main">

## Introduction

Dependency injection is a common method for structuring modules. It is native in frontend frameworks like Angular and can be used for any JS modules in the same manner using library like [InversifyJS](http://inversify.io/), [tsyringe](https://github.com/microsoft/tsyringe), ...

But you can also manually apply DI to any module using this simple method. There is a central class (`Lib` for library, `Cli` for cli app, `App` for app, ...) that acts as a DI container and injector.

```ts
// the service 1
export class Service1Service {}

// the service 2 is depends on the service 1
export class Service2Service {
  constructor(private service1Service: Service1Service) {}
}

// the container for all services and also the injetor
export class Lib {
  service1Service: Service1Service;
  service2Service: Service2Service;

  constructor() {
    this.service1Service = new Service1Service();
    this.service2Service = new Service2Service(
      this.service1Service // injects the service 1
    );
  }
}
```

## Benefits

- One approaching for any project
- Clean project structure
- No need for extra IOC libraries
- Easy to test (using [@lamnhan/testea](https://github.com/lamnhan/testea))
- Easy to generate documentation (using [@lamnhan/ayedocs](https://github.com/lamnhan/ayedocs))

## Installation

Install as glocal CLI app.

```sh
npm install -g @lamnhan/seminjecto
```

## Skeletons

These skeletons can be use to faster setup a project. You can either clone them manually or using the command [`semidi new <name>`](#command-new):

- [Library](https://github.com/lamnhan/seminjecto-lib): Any library.
- [CLI](https://github.com/lamnhan/seminjecto-cli): Node CLI app.
- [Express](https://github.com/lamnhan/seminjecto-express): ExpressJS app.
- [Sheetbase](https://github.com/lamnhan/seminjecto-sheetbase): Sheetbase server app.
- [Workspace](https://github.com/lamnhan/seminjecto-workspace): Google Workspace (G Suite) add-on.

## Convention

This standalization is applied to any project unders **Seminjecto** convention.

### Helpers

#### VSCode

The file `settings.json` unders `.vscode` folder provides configuration for excluding certain content in VSCode (and other configs you may need):

See [.vscode/settings.json](https://github.com/lamnhan/seminjecto/blob/master/.vscode/settings.json)

#### GIT

Files are ignored by GIT:

See [.gitignore](https://github.com/lamnhan/seminjecto/blob/master/.gitignore)

#### Linter/prettier

Linter and prettier using [@google/gts](https://github.com/google/gts):

- The `.eslintrc.json`: the Eslint config file
- The `.prettierrc.js`: the Prettier config file
- Lint by: `npm run lint`

#### Documentation

Automatic document generation using [@lamnhan/ayedocs](https://github.com/lamnhan/ayedocs):

- The file `.ayedocsrc.js` provides configuration
- Output will be found in the `docs` folder
- Generate docs by: `npm run docs`

#### Testing

Testing using [@lamnhan/testea](https://github.com/lamnhan/testea):

- Generate spec files by: `testea generate`
- All specs files are under `test` folder
- Run test by: `npm run test`

#### Continuous integration

See [.travis.yml](https://github.com/lamnhan/seminjecto/blob/master/.travis.yml)

#### Vendor code

When you want to include code from other projects, put them into `src/lib/vendors/name.vendor.ts`. For example, a function from `lodash`.

Add `// @ts-nocheck` at the top of the files to disable Typescript.

Vendor files also excluded from linting.

#### Special deployment

Libraries for Node projects are deployed with the `src/` folder that contains all the content.

Special project will be deployed from the `.deploy/` folder:

- Refer using a script (... deploy) to generate `.deploy/`, then deploy, then remove `.deploy/`.
- Pass `--dry-run` to the script to generate `.deploy/` only.

### Project types

**Seminjecto** supports these types of Node project, where source code is hosted under `src` folder.

#### Library

A library is a project that can using in other projects.

A library is organized into a pair of file and folder:

- The `public-api.ts` file: where you export anything you want other project to access
- The `lib` folder: the lirary home, contains `index.ts` (class `Lib`) and groups of source code by type (services, ...)

See [package.json](https://github.com/lamnhan/seminjecto/blob/master/package.json) for properties and scripts.

#### CLI

A CLI project is an extended of library, a pair of file and folder added:

- The `bin.ts` file: the cli logic
- The `cli` folder: the CLI home, contains `index.ts` (class `Cli`) and groups of source code by type (commands, ...)

See `bin` property in [package.json](https://github.com/lamnhan/seminjecto/blob/master/package.json) for CLI app registration.

#### Express

A ExpressJS project is an extended of library, a pair of file and folder added:

- The `www.ts` file: the app logic
- The `app` folder: the app home, contains `index.ts` (class `App`) and groups of source code by type (routes, ...)

#### Sheetbase

A Sheetbase project is an extended of library, a pair of file and folder added:

- The `www.ts` file: the app logic
- The `app` folder: the app home, contains `index.ts` (class `App`) and groups of source code by type (routes, ...)

#### Workspace

A Workspace project is an extended of library, a pair of file and folder added:

- The `hook.ts` file: the addon logic
- The `addon` folder: the addon home, contains `index.ts` (class `Addon`) and groups of source code by type (sidebars, modals, ...)

</section>

<section id="cli" data-note="AUTO-GENERATED CONTENT, DO NOT EDIT DIRECTLY!">

<h2><a name="cli-command-overview"><p>Command overview</p>
</a></h2>

Simple dependency injection for Typescript modules.

- [`semidi clean|c --skip-question --list --includes [value] --excludes [value]`](#command-clean)
- [`semidi generate|create|g <type> <dest> --nested --typing`](#command-generate)
- [`semidi new|start|n <type> <name> [description] --source [value] --skip-install --skip-git`](#command-new)
- [`semidi help`](#command-help)
- [`semidi *`](#command-*)

<h2><a name="cli-command-reference"><p>Command reference</p>
</a></h2>

<h3><a name="command-clean"><p><code>clean</code></p>
</a></h3>

Clean typescript output files.

**Usage:**

```sh
semidi clean --skip-question --list --includes [value] --excludes [value]
semidi c --skip-question --list --includes [value] --excludes [value]
```

**Options:**

- `-y, --skip-question`: Does not ask question.
- `-l, --list`: Show list of files.
- `-i, --includes [value]`: Including files, separated by `|`.
- `-e, --excludes [value]`: Excluding files, separated by `|`.

<h3><a name="command-generate"><p><code>generate</code></p>
</a></h3>

Generate a resource.

**Usage:**

```sh
semidi generate <type> <dest> --nested --typing
semidi create <type> <dest> --nested --typing
semidi g <type> <dest> --nested --typing
```

**Parameters:**

- `<type>`: The resource type
- `<dest>`: The resource destination

**Options:**

- `-n, --nested`: Nested under a folder.
- `-t, --typing`: Save typing file.

<h3><a name="command-new"><p><code>new</code></p>
</a></h3>

Create a new project.

**Usage:**

```sh
semidi new <type> <name> [description] --source [value] --skip-install --skip-git
semidi start <type> <name> [description] --source [value] --skip-install --skip-git
semidi n <type> <name> [description] --source [value] --skip-install --skip-git
```

**Parameters:**

- `<type>`: The project type: lib, cli, sheetbase, ... or {any}.
- `<name>`: The project name.
- `[description]`: The project description.

**Options:**

- `-s, --source [value]`: Custom sources.
- `-i, --skip-install`: Does not install dependency packages.
- `-g, --skip-git`: Does not initialize a git repository.

<h3><a name="command-help"><p><code>help</code></p>
</a></h3>

Display help.

**Usage:**

```sh
semidi help
```

<h3><a name="command-*"><p><code>*</code></p>
</a></h3>

Any other command is not suppoted.

**Usage:**

```sh
semidi <cmd>
```

</section>

<section id="license" data-note="AUTO-GENERATED CONTENT, DO NOT EDIT DIRECTLY!">

## License

**@lamnhan/seminjecto** is released under the [MIT](https://github.com/lamnhan/seminjecto/blob/master/LICENSE) license.

</section>

<section id="attr">

---

⚡️ This document is generated automatically using [@lamnhan/ayedocs](https://github.com/lamnhan/ayedocs).

</section>
