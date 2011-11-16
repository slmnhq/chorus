describe("chorus.models.User", function() {
    var models = chorus.models;
    beforeEach(function() {
        fixtures.model = 'User';
        this.model = new models.User();
    });

    it("has the correct urlTemplate", function() {
        expect(this.model.urlTemplate).toBe("user/{{userName}}");
    });

    describe("#getWorkspaces", function() {
       beforeEach(function() {
          this.user = new models.User({userName: "dr_charlzz"});
          this.workspaces = this.user.getWorkspaces();
       });

       it("returns an instance of WorkspaceSet", function() {
          expect(this.workspaces instanceof chorus.models.WorkspaceSet).toBeTruthy();
       });

       context("when fetched", function() {
          beforeEach(function() {
              this.workspaces.fetch();
          });

          it("hits the right url for that user", function() {
            var expectedUrl = "/edc/workspaces?user=" + this.user.get("userName");
            expect(this.server.requests[0].url).toBe(expectedUrl);
          });
       });
    });
});