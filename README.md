# Temple ACM Site

Temple ACM's site is built off of the [MEAN](http://mean.io) stack, which basically uses javascript/json at every layer (browser, server and database). The technologies involved are as follows: [MongoDB](http://www.mongodb.org/), [Node.js](http://www.nodejs.org/), [Express](http://expressjs.com/), and [AngularJS](http://angularjs.org/).

## Getting Source
To download the source of the website, you'll need to use git's clone feature. This only works if you are registered as a contributor.
```
git clone git@github.com:/temple-acm/site -b revamp
```
If you are not recognized as a contributor, you need to _fork this repository_ and *not* do a vanilla clone.

## Prerequisites
* UNIX Development Environment (OSX, BSD, Linux) - If you're on Windows, try [this guide](http://www.howtogeek.com/howto/11287/how-to-run-ubuntu-in-windows-7-with-vmware-player/)
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

## Running the Site
The quickest way to get started with MEAN is to clone the project and utilize it like this:

Install dependencies:

    $ npm install
    $ bower install

  Use [gulp](http://gulpjs.com/) to start the server:

    $ gulp
    
  Then open a browser and go to:

    https://localhost:3000
    
  OR, if you are on Windows, and therefore running the server in a VM, replace 'localhost' with IP address of the VM.

## Production Setup
In production we change the way we make a few concessions:
- Mongo DB, our database, is run locally on the same box as the web server instead hosted by [Compose](http://compose.io)
- We use environment variables for sensitive information instead of the development defaults
- We use [HAProxy](http://haproxy.org) for reverse proxying
- We *only* support HTTPS

The variables we use are as follows:
- TUACM_LOGPATH - The path where logs will be put
- TUACM_PORT - The port that the web server is listening for HTTP requests on
- TUACM_SESSION_SECRET - The secret used for salting session tokens
- TUACM_MONGO_URL - The connection string for mongo

To setup the environment variables properly, decrypt env.sh.gpg:
```gpg env.sh.gpg```
Then, run env.sh to setup environment variables for production:
```chmod +x env.sh
./env.sh```

To manage and query our data, we use [Robomongo](http://robomongo.org).

## Questions?
Come and ask for assistance or just hangout in our [Slack](http://tuacm.slack.com) channel. Use ```@group``` to notify everyone in the group of your message.

## Credits
Inspired by the great work of [Madhusudhan Srinivasa](https://github.com/madhums/), and made possible by the good people at [linnovate](http://www.linnovate.net/). Also thank your lord and savior [Sandile Keswa](https://github.com/skeswa/).

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
