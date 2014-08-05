# Temple ACM Site  [![Gitter chat](https://badges.gitter.im/temple-acm.png)](https://gitter.im/temple-acm)

Temple ACM's site is built off of the [MEAN](http://mean.io) stack, which basically uses javascript/json at every layer (browser, server and database). The technologies involved are as follows: [MongoDB](http://www.mongodb.org/), [Node.js](http://www.nodejs.org/), [Express](http://expressjs.com/), and [AngularJS](http://angularjs.org/).

## Prerequisites
* Node.js - Download and Install [Node.js](http://www.nodejs.org/download/)

### Tools Prerequisites
* [Bower](http://bower.io/) - Web package manager:

```
$ npm install -g bower
```
* [Gulp](http://gulpjs.com/) - Streaming build manager:

```
$ npm install -g gulp
```

## Quick Install
  The quickest way to get started with MEAN is to clone the project and utilize it like this:

  Install dependencies:

    $ npm install

  Use [gulp](http://gulpjs.com/) to start the server:

    $ gulp
    
  Then open a browser and go to:

    http://localhost:3000

#### Cleaning NPM and Bower cache
NPM and Bower has a caching system for holding packages that you already installed.
We found that often cleaning the cache solves some troubles this system creates.

NPM Clean Cache:
```
$ npm cache clean
```

Bower Clean Cache:
```
$ bower cache clean
```

## Credits
Inspired by the great work of [Madhusudhan Srinivasa](https://github.com/madhums/), and made possible by the good people at [linnovate](http://www.linnovate.net/).

## License
(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
