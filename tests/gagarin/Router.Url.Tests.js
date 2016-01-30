
describe('clinical:router-url', function () {
  var server = meteor();
  var client = browser(server);

  it('Router should exist on the client', function () {
    return client.execute(function () {
      expect(Url).to.exist;
    });
  });

  it('Router should be undefined on the server', function () {
    return server.execute(function () {
      //expect(typeof Router).to.equal("undefined");
      expect(Url).to.be.undefined;
    });
  });
});
