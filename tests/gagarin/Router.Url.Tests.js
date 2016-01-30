
describe('clinical:router-url', function () {
  var server = meteor();
  var client = browser(server);

  it('Url should exist on the client', function () {
    return client.execute(function () {
      expect(Url).to.exist;
    });
  });

  it('Url should be undefined on the server', function () {
    return server.execute(function () {
      //expect(typeof Router).to.equal("undefined");
      expect(Url).to.equal("undefined");
    });
  });
});
