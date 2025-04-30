# Overview

The goal of this project is to build an MQTT library in typescript for the Snap Spectacles.  It ideally works with WS or TCP sockets, though at this stage it probably must be Web Sockets.

## Design

Without studying the spec too deeply, porting over a minimalist browser based mqtt library client for MQTT 3.1 or so.  If successful, it should be possible to use this in spectacles applications with experimental APIs on.

## Status

In progress.  Web stockets must be integrated and then testing.

Currently this crashes.  Lot of vibe coding here.  I will ditch the first effort in favor of a different approach that starts with something written in typescript to start with, or use the ts.d bindings added.  The complication with the use of JS/TS in the Lens environment is a challenge in terms of getting your head around the development of libraries.

## Testing

There is an example project provided.  It will just ping the test.mosquitto.org when the button toggle is hit.

## Known Issues

- Needs to support MQTT > 3.1
- Needs security
- Needs a test suite
- Needs to work with TCP and any other transports
- Will not work without security on
- The original JS used for the MQTT needs to ge modernized so that it is starting from .TS and then generates the .JS ... in this way, one could truly verify the portability.
- There may be a more efficient design.  Since most JS libraries started in the browser or in Node.js, this one has elements of Node.js.  


