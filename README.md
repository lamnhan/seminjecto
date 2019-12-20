<section id="head" data-note="AUTO-GENERATED CONTENT, DO NOT EDIT DIRECTLY!">

# @lamnhan/seminjecto

**Simple dependency injection for Typescript modules.**

</section>

<section id="header">

[![License][license_badge]][license_url] [![Support me on Patreon][patreon_badge]][patreon_url] [![PayPal][paypal_donate_badge]][paypal_donate_url] [![Ask me anything][ask_me_badge]][ask_me_url]

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
- [Command overview](#command-overview)
- [Command reference](#command-reference)
  - [`generate`](#command-generate)
  - [`new`](#command-new)
  - [`help`](#command-help)
- [Detail API reference](https://lamnhan.com/seminjecto)


</section>

<section id="main">

## Introduction

Dependency injection is a common method for structuring modules. It is native in frontend frameworks like Angular and can be used for any JS modules in the same manner using library like [InversifyJS](http://inversify.io/), [tsyringe](https://github.com/microsoft/tsyringe), ...

But you can also manually apply DI to any module using this simple method. There is a central class (`Main` for library, `Cli` for cli app, `App` for app, ...) that acts as a DI container and injector.

```ts
// the service 1
export class Service1Service {}

// the service 2 is depends on the service 1
export class Service2Service {
  constructor(private service1Service: Service1Service) {}
}

// the container for all services and also the injetor
export class Main {
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

- No need for extra IOC libraries
- Clean project structure
- Easy to test (using [@lamnhan/testea](https://github.com/lamnhan/testea))
- Easy to generate documentation (using [@lamnhan/ayedocs](https://github.com/lamnhan/ayedocs))

## Installation

Install as glocal CLI app.

```sh
npm install -g @lamnhan/seminjecto
```

## Skeletons

These skeletons can be use to faster setup a project. You can either clone them manually or using the command [`semidi new <name>`](#command-new):

- [Library](https://github.com/lamnhan/seminjecto-lib): For any normal library.
- [CLI](https://github.com/lamnhan/seminjecto-cli): For building a Node CLI app.

</section>

<section id="cli" data-note="AUTO-GENERATED CONTENT, DO NOT EDIT DIRECTLY!">

<h2><a name="command-overview"><p>Command overview</p>
</a></h2>

Simple dependency injection for Typescript modules.

- [`semidi generate <type> <dest>`](#command-generate)
- [`semidi new <name> [description] --cli`](#command-new)
- [`semidi help`](#command-help)

<h2><a name="command-reference"><p>Command reference</p>
</a></h2>

<h3><a name="command-generate"><p><code>generate</code></p>
</a></h3>

Generate a resource.

**Parameters**

- `<type>`: The resource type
- `<dest>`: The resource destination

<h3><a name="command-new"><p><code>new</code></p>
</a></h3>

Create a new project.

**Parameters**

- `<name>`: The project name
- `[description]`: The project description

**Options**

- `-x, --cli`: Create a CLI project.

<h3><a name="command-help"><p><code>help</code></p>
</a></h3>

Display help.

</section>

<section id="license" data-note="AUTO-GENERATED CONTENT, DO NOT EDIT DIRECTLY!">

## License

**@lamnhan/seminjecto** is released under the [MIT](https://github.com/lamnhan/seminjecto/blob/master/LICENSE) license.

</section>

<section id="attr">

---

⚡️ This document is generated automatically using [@lamnhan/ayedocs](https://github.com/lamnhan/ayedocs).

</section>
