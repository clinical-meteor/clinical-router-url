Iron Url
==================
Url utilities and support for compiling a url into a regular expression.


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
#### Licensing  

MIT.  Use as you will.
