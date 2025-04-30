# Overview

The goal of this project is to build an MQTT library in typescript for the Snap Spectacles.  It ideally works with WS or TCP sockets, though at this stage it probably must be Web Sockets.

## Design

Without studying the spec too deeply, porting over a minimalist browser based mqtt library client for MQTT 3.1 or so.  If successful, it should be possible to use this in spectacles applications with experimental APIs on.

## Status

In progress.  Web stockets must be integrated and then testing.

Currently this crashes.  Lot of vibe coding here.  I will ditch the first effort in favor of a different approach that starts with something written in typescript to start with, or use the ts.d bindings added.  The complication with the use of JS/TS in the Lens environment is a challenge in terms of getting your head around the development of libraries.

## Design

### Approach 1

- On branch approach1-vibeit

This work was done over a few days, to build a sample project that would communicate with the mqtt test broker using websockets.  Grab some dirt simple JS libraries, vibe them into typescript (partially manually), and build a component wrapper to use it.

Issues: 

- I don't actually know how to reference individual libary classes as JS or Typescript that aren't already built as components.  The IDE doesn't really help much, but the compiler errors indicate everything must be a component. 
- If I can't load individual library files, I have to put them all together into one file.  It's a jumble, 1200+ lines of code
- Most libraries out there are for Node.js ecosystem, or browser ecosystem.  Both have fairly rich environment for libaries that are guaranteed to be there.  I can polyfill functionality.  I can provide alternative implementation.  EventEmitter is a good example of a libary that is very useful and works well if implemented fully.
- I realize there isn't a way to do multiple inheritance, so I can't extend BaseScriptingComponent and the EventEmitter library.  I guess there is a way to do a mixin, but I need to get my head around the constructor needed for this.
- I tried wrapping an inner class inside of my main component, and extending EventEmitter that way, however, there seems to be no way to find the Inner Class's reference to EventEmitter.  Compiler fails though it seems it shouldn't.
- I figured out a good way to get access to the parent Component, and this appears to be good enough for access from the inner class that is handling the connection for mqtt.
- The MQTT port is using a generic Buffer object.  This code crashes shortly after I hit _OnConnecting, and in the call to write to the Buffer.  No idea why. 
- Complaint: IDE debugging doesn't really provide the right level of visibility when the Lens crashes. 
 
I will park this code.  Move to approach 2.

### Approach 2

Try to get a handle on "the right way" to do Typescript library code in the context of Snap Spectacles development.  

- review: https://developers.snap.com/lens-studio/features/scripting/typescript
- https://developers.snap.com/lens-studio/features/scripting/accessing-components
- try to get a project like this: https://github.com/srishina/mqtt.ts ported

Need to start, work will go on main.

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


