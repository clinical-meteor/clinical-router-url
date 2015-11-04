/*****************************************************************************/
/* Imports */
/*****************************************************************************/
var warn = Iron.utils.warn;
var assert = Iron.utils.assert;

/*****************************************************************************/
/* Url */
/*****************************************************************************/
function safeDecodeURIComponent (val) {
  try {
    return decodeURIComponent(val.replace(/\+/g, ' '));
  } catch (e) {
    if (e.constructor == URIError) {
      warn("Tried to decode an invalid URI component: " + JSON.stringify(val) + " " + e.stack);
    }

    return undefined;
  }
}

function safeDecodeURI (val) {
  try {
    return decodeURI(val.replace(/\+/g, ' '));
  } catch (e) {
    if (e.constructor == URIError) {
      warn("Tried to decode an invalid URI: " + JSON.stringify(val) + " " + e.stack);
    }

    return undefined;
  }
}

/**
 * Url utilities and the ability to compile a url into a regular expression.
 */
Url = function (url, options) {
  options = options || {};
  this.options = options;
  this.keys = [];
  this.regexp = compilePath(url, this.keys, options);
  this._originalPath = url;
  _.extend(this, Url.parse(url));
};

// We need to have a ROOT URL without the path prefix so we can add ironRouters' routes to it to create
// nice absolute paths on the server, including the path prefix, but only once, not twice.
// We'll store that in Url.ROOT_URL_WITHOUT_PATH_PREFIX.
var ROOT_URL_WITHOUT_PATH_PREFIX = __meteor_runtime_config__.ROOT_URL;
if (__meteor_runtime_config__.ROOT_URL_PATH_PREFIX) {
  var pos = __meteor_runtime_config__.ROOT_URL.indexOf(__meteor_runtime_config__.ROOT_URL_PATH_PREFIX);
  if (pos != -1) {
    ROOT_URL_WITHOUT_PATH_PREFIX = __meteor_runtime_config__.ROOT_URL.substr(0, pos)
  }
}

// add the root URL without path prefix to the Url
Url.ROOT_URL_WITHOUT_PATH_PREFIX = ROOT_URL_WITHOUT_PATH_PREFIX;

/**
 * Given a relative or absolute path return
 * a relative path with a leading forward slash and
 * no search string or hash fragment
 *
 * @param {String} path
 * @return {String}
 */
Url.normalize = function (url) {
  if (url instanceof RegExp)
    return url;
  else if (typeof url !== 'string')
    return '/';

  var parts = Url.parse(url);
  var pathname = parts.pathname;

  if (pathname.charAt(0) !== '/')
    pathname = '/' + pathname;

  if (pathname.length > 1 && pathname.charAt(pathname.length - 1) === '/') {
    pathname = pathname.slice(0, pathname.length - 1);
  }

  return pathname;
};

/**
 * Returns true if both a and b are of the same origin.
 */
Url.isSameOrigin = function (a, b) {
  var aParts = Url.parse(a);
  var bParts = Url.parse(b);
  var result = aParts.origin === bParts.origin;
  return result;
};

/**
 * Given a query string return an object of key value pairs.
 *
 * "?p1=value1&p2=value2 => {p1: value1, p2: value2}
 */
Url.fromQueryString = function (query) {
  if (!query)
    return {};

  if (typeof query !== 'string')
    throw new Error("expected string");

  // get rid of the leading question mark
  if (query.charAt(0) === '?')
    query = query.slice(1);

  var keyValuePairs = query.split('&');
  var result = {};
  var parts;

  _.each(keyValuePairs, function (pair) {
    var parts = pair.split('=');
    var key = parts[0];
    var value = safeDecodeURIComponent(parts[1]);

    if (key.slice(-2) === '[]') {
      key = key.slice(0, -2);
      result[key] = result[key] || [];
      result[key].push(value);
    } else {
      result[key] = value;
    }
  });

  return result;
};

/**
 * Given a query object return a query string.
 */
Url.toQueryString = function (queryObject) {
  var result = [];

  if (typeof queryObject === 'string') {
    if (queryObject.charAt(0) !== '?')
      return '?' + queryObject;
    else
      return queryObject;
  }

  _.each(queryObject, function (value, key) {
    if (_.isArray(value)) {
      _.each(value, function(valuePart) {
        result.push(encodeURIComponent(key + '[]') + '=' + encodeURIComponent(valuePart));
      });
    } else {
      result.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }
  });

  // no sense in adding a pointless question mark
  if (result.length > 0)
    return '?' + result.join('&');
  else
    return '';
};

/**
 * Given a string url return an object with all of the url parts.
 */
Url.parse = function (url) {
  if (typeof url !== 'string')
    return {};

  //http://tools.ietf.org/html/rfc3986#page-50
  //http://www.rfc-editor.org/errata_search.php?rfc=3986
  var re = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

  var match = url.match(re);

  var protocol = match[1] ? match[1].toLowerCase() : undefined;
  var hostWithSlashes = match[3];
  var slashes = !!hostWithSlashes;
  var hostWithAuth= match[4] ? match[4].toLowerCase() : undefined;
  var hostWithAuthParts = hostWithAuth ? hostWithAuth.split('@') : [];

  var host, auth;

  if (hostWithAuthParts.length == 2) {
    auth = hostWithAuthParts[0];
    host = hostWithAuthParts[1];
  } else if (hostWithAuthParts.length == 1) {
    host = hostWithAuthParts[0];
    auth = undefined;
  } else {
    host = undefined;
    auth = undefined;
  }

  var hostWithPortParts = (host && host.split(':')) || [];
  var hostname = hostWithPortParts[0];
  var port = hostWithPortParts[1];
  var origin = (protocol && host) ? protocol + '//' + host : undefined;
  var pathname = match[5];
  var hash = match[8];
  var originalUrl = url;

  var search = match[6];

  var query;
  var indexOfSearch = (hash && hash.indexOf('?')) || -1;

  // if we found a search string in the hash and there is no explicit search
  // string
  if (~indexOfSearch && !search) {
    search = hash.slice(indexOfSearch);
    hash = hash.substr(0, indexOfSearch);
    // get rid of the ? character
    query = search.slice(1);
  } else {
    query = match[7];
  }

  var path = pathname + (search || '');
  var queryObject = Url.fromQueryString(query);

  var rootUrl = [
    protocol || '',
    slashes ? '//' : '',
    hostWithAuth || ''
  ].join('');

  var href = [
    protocol || '',
    slashes ? '//' : '',
    hostWithAuth || '',
    pathname || '',
    search || '',
    hash || ''
  ].join('');

  return {
    rootUrl: rootUrl || '',
    originalUrl: url || '',
    href: href || '',
    protocol: protocol || '',
    auth: auth || '',
    host: host || '',
    hostname: hostname || '',
    port: port || '',
    origin: origin || '',
    path: path || '',
    pathname: pathname || '',
    search: search || '',
    query: query || '',
    queryObject: queryObject || '',
    hash: hash || '',
    slashes: slashes
  };
};

/**
 * Returns true if the path matches and false otherwise.
 */
Url.prototype.test = function (path) {
  path = Url.normalize(path);
  path = Url.trimPathPrefixAccordingToMeteorRootUrlSettingsForRouteMatching(path);
  return this.regexp.test(path);
};

/**
 * Returns the result of calling exec on the compiled path with
 * the given path.
 */
Url.prototype.exec = function (path) {
  path = Url.normalize(path);
  path = Url.trimPathPrefixAccordingToMeteorRootUrlSettingsForRouteMatching(path);
  return this.regexp.exec(path);
};

/**
 * Returns an array of parameters given a path. The array may have named
 * properties in addition to indexed values.
 */
Url.prototype.params = function (path) {
  if (!path)
    return [];

  var params = [];
  var m = this.exec(path);
  var queryString;
  var keys = this.keys;
  var key;
  var value;

  if (!m)
    throw new Error('The route named "' + this.name + '" does not match the path "' + path + '"');

  for (var i = 1, len = m.length; i < len; ++i) {
    key = keys[i - 1];
    value = typeof m[i] == 'string' ? safeDecodeURIComponent(m[i]) : m[i];
    if (key) {
      params[key.name] = params[key.name] !== undefined ?
        params[key.name] : value;
    } else
      params.push(value);
  }

  path = safeDecodeURI(path);

  if (typeof path !== 'undefined') {
    queryString = path.split('?')[1];
    if (queryString)
      queryString = queryString.split('#')[0];

    params.hash = path.split('#')[1] || null;
    params.query = Url.fromQueryString(queryString);
  }

  return params;
};

Url.prototype.resolve = function (params, options) {
  var value;
  var isValueDefined;
  var result;
  var wildCardCount = 0;
  var path = this._originalPath;
  var hash;
  var query;
  var missingParams = [];
  var originalParams = params;

  options = options || {};
  params = params || [];
  query = options.query;
  hash = options.hash && options.hash.toString();

  if (path instanceof RegExp) {
    throw new Error('Cannot currently resolve a regular expression path');
  } else {
    path = path
      .replace(
        /(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g,
        function (match, slash, format, key, capture, optional, offset) {
          slash = slash || '';
          value = params[key];
          isValueDefined = typeof value !== 'undefined';

          if (optional && !isValueDefined) {
            value = '';
          } else if (!isValueDefined) {
            missingParams.push(key);
            return;
          }

          value = _.isFunction(value) ? value.call(params) : value;
          var escapedValue = _.map(String(value).split('/'), function (segment) {
            return encodeURIComponent(segment);
          }).join('/');
          return slash + escapedValue
        }
      )
      .replace(
        /\*/g,
        function (match) {
          if (typeof params[wildCardCount] === 'undefined') {
            throw new Error(
              'You are trying to access a wild card parameter at index ' +
              wildCardCount +
              ' but the value of params at that index is undefined');
          }

          var paramValue = String(params[wildCardCount++]);
          return _.map(paramValue.split('/'), function (segment) {
            return encodeURIComponent(segment);
          }).join('/');
        }
      );

    query = Url.toQueryString(query);

    path = path + query;

    if (hash) {
      hash = encodeURI(hash.replace('#', ''));
      path = path + '#' + hash;
    }
  }

  // Because of optional possibly empty segments we normalize path here
  path = path.replace(/\/+/g, '/'); // Multiple / -> one /
  path = path.replace(/^(.+)\/$/g, '$1'); // Removal of trailing /

  path = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX + path

  if (missingParams.length == 0)
    return path;
  else if (options.throwOnMissingParams === true)
    throw new Error("Missing required parameters on path " + JSON.stringify(this._originalPath) + ". The missing params are: " + JSON.stringify(missingParams) + ". The params object passed in was: " + JSON.stringify(originalParams) + ".");
  else
    return null;
};

/**
 * If the entire Meteor project is running in a subdirectory of the webserver (eg. myapp.com/beta/), it's probably being started with setting
 * the Meteor ROOT_URL - variable to allow for serving from that specific URL, including the subdirectory, as in
 *
 * ROOT_URL="http://myapp.com/beta" meteor .
 *
 * To be able to match routes containing the prefix ("/beta/" in the example) in front of the main route, we'll trim the part in front of the path
 * configured via ROOT_URL.
 *
 * In short: "/beta/myRoutePath" -> "/myRoutePath".
 *
 * This function will be called when a route should be matched.
 *
 * Note that on the server the transformation / stripping of the rootUrlPathPrefix is taken care of by meteors' HTTP stack and doesn't mustn't be trimmed there.
 *
 * We take care of that inside of the function, but it should probably be taken care of by the calling side.
 *
 * @param {String} path
 * @return {String}
 */
 
Url.trimPathPrefixAccordingToMeteorRootUrlSettingsForRouteMatching = function(path) {
  var rootUrlPathPrefix = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX;
  if (Meteor.isClient && rootUrlPathPrefix) {
    assert(path.substring(0, rootUrlPathPrefix.length) === rootUrlPathPrefix, "Unknown path prefix, expected: '" + rootUrlPathPrefix + "'");
    path = path.substring(rootUrlPathPrefix.length);
  }
  return path;
};


/*****************************************************************************/
/* Namespacing */
/*****************************************************************************/
Iron.Url = Url;
