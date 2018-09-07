# Bureau Works API Command Line Interface and NodeJS module
This repository contains a JavaScript library that can be used to access the Bureau Works API. It also includes a CLI written in NodeJS that facilitates API calls from the command line.

## Requirements

You need a Bureau Works account and API KEY. Please visit https://www.bureauworks.com to get yours!

You will also need NodeJS and git installed in your environment.

For API reference, please visit https://dev.bureau.works

## Installation

Clone this repository:

```git clone https://github.com/bureauworks/cli.git```

Then install `npm` dependencies

```npm i```

Make the CLI friends with your shell environment

```chmod +x cli.js```

Run the Configuration once - this will create a `config.json` file in your `~/.bwx/` directory:

```./cli.js config```

You can use `npm link` to allow us to locally ‘symlink a package folder’. If you do so, you can call the CLI anywhere in your system with the `bwx` shorthand:

```bwx timezones```

```bwx languages```

For the help, use:

```bwx --help```

Or for specific commands, for example, the project creation command:

```bwx create --help```