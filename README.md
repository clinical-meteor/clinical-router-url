Clinical Router Url

==================
Url utilities and support for compiling a url into a regular expression.

[![Circle CI](https://circleci.com/gh/clinical-meteor/router-url/tree/master.svg?style=svg)](https://circleci.com/gh/clinical-meteor/router-url/tree/master)

===============================
#### Installation  

This package is a dependency of ``clinical:router``.  Just install the router package, and you'll get this included.

````bash
meteor add clinical:router
````

===============================
#### Route Prefixes

You can add a route prefix by specifying a suffix in the ``ROOT_URL``, like so:

````bash
ROOT_URL="http://localhost:3000/admin" meteor
````

All subsequent routes will be available on the ``/admin`` prefix.  

===============================
#### Generating URL Paths

````js
//http://mydomain.com
Meteor.absoluteUrl.defaultOptions.rootUrl = "http://mydomain.com"

//http://mydomain.com/foo
Meteor.absoluteUrl("/foo", {});
````

===============================
#### Licensing  

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)
