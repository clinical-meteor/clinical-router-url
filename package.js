Package.describe({
  name: 'clinical:router-url',
  summary: 'Url utilities and support for compiling a url into a regular expression.',
  version: '2.0.15',
  git: 'https://github.com/clinical-meteor/clinical-router-url'
});

Package.on_use(function (api) {
  api.versionsFrom('METEOR@1.1.0.3');

  api.use('underscore');

  api.use('iron:core@1.0.11');
  api.imply('iron:core');

  api.add_files('lib/compiler.js');
  api.add_files('lib/url.js');

  api.export('Url', 'client');
});

Package.on_test(function (api) {
  api.use('clinical:router-url');
  api.use('tinytest');
  api.use('test-helpers');
  api.add_files('test/url_test.js', ['client', 'server']);
});
