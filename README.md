# SNAP - web application

Browser SNAP application wrapper. See `dts-snap` for the actual client application code.

## Workflow

`master` branch automatically gets built on CI server and published to the web.

## Prerequisites

1. Node.js or io.js
2. Bower

## First time setup

1. `npm install && bower install`

To test the web application, create a symlink in place of the `dts-snap-web` Bower package to the actual client side project directory with `ln -s /path/to/dts-snap/ ./bower_components/dts-snap` (`mklink /D bower_components\dts-snap \path\to\dts-snap\` on Windows).

## Development

Run `grunt dev` to launch the development environment.

When running the application locally for the first time, you need to obtain an access key. Follow the registration process and once you'll get redirected to and error page, copy the URL part starting from `#` and open `http://localhost:3300/startup.html#copied_part_here`.
