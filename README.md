<<<<<<< HEAD
<<<<<<< HEAD
# SNAP - client web application

Shared SNAP client web application files. See `dts-snap-mobile` and `dts-snap-desktop` for platform-specific wrapper applications.

## Workflow

`master` branch automatically gets built on CI server and the result is marked with a GIT tag, which is then referenced with Bower in wrapper application projects.
=======
# SNAP - web application

Browser SNAP application wrapper. See `dts-snap` for the actual client application code.

## Workflow

`master` branch automatically gets built on CI server and published to the web.
>>>>>>> 8caf959da8f7546d302bd5cbf5caaa778bf7334b

## Prerequisites

1. Node.js or io.js
2. Bower

## First time setup

<<<<<<< HEAD
1. `npm install`
2. `bower install`
=======
1. `npm install && bower install`

To test the web application, create a symlink in place of the `dts-snap-web` Bower package to the actual client side project directory with `ln -s /path/to/dts-snap/ ./bower_components/dts-snap` (`mklink /D bower_components\dts-snap \path\to\dts-snap\` on Windows).
>>>>>>> 8caf959da8f7546d302bd5cbf5caaa778bf7334b

## Development

Run `grunt dev` to launch the development environment.
<<<<<<< HEAD
=======

When running the application locally for the first time, you need to obtain an access key. Follow the registration process and once you'll get redirected to and error page, copy the URL part starting from `#` and open `http://localhost:3300/startup.html#copied_part_here`.
>>>>>>> 8caf959da8f7546d302bd5cbf5caaa778bf7334b
=======
# NewRepo
Test repository
>>>>>>> 68f9f8a20d263ea9249b9895b0f8d1cecfd37127
