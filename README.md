# SNAP - client web application

Shared SNAP client web application files. See `dts-snap-mobile` and `dts-snap-desktop` for platform-specific wrapper applications.

## Workflow

`master` branch automatically gets built on CI server and the result is marked with a GIT tag, which is then referenced with Bower in wrapper application projects.

## Prerequisites

1. Node.js or io.js
2. Bower

## First time setup

1. `npm install`
2. `bower install`

## Development

Run `grunt dev` to launch the development environment.
