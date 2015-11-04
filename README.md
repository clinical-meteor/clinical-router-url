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
#### Environment Variables  

This will detect and use the following environment variables.

````
ROOT_URL_PATH_PREFIX
ROOT_URL
````

===============================
#### Usage  

Specify the environment variables when you launch your application...

````bash
ROOT_URL_PATH_PREFIX=CRF ROOT_URL=medbook.uscs.edu meteor
````

And your application will use the variables as it's Url path to the application.  

````bash
http://medbook.ucsc.edu/CRF/
````

===============================
#### Licensing  

MIT.  Use as you will.
