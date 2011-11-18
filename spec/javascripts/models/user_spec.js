describe("chorus.models.User", function() {
    var models = chorus.models;
    beforeEach(function() {
        fixtures.model = 'User';
        this.model = new models.User();
    });

    it("has the correct showUrlTemplate", function() {
        expect(this.model.showUrlTemplate).toBe("users/{{userName}}");
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

        it("returns the same instance every time", function(){
            expect(this.user.getWorkspaces()).toBe(this.workspaces);
        });

        context("when the workspaces instance raises its reset event", function(){
            it("raises the changed event on the user instance", function(){
                var spy = jasmine.createSpy("changeHandler");
                this.user.bind("change", spy);
                this.workspaces.trigger("reset");
                expect(spy).toHaveBeenCalled();
            });

            it("only fires the change event once, even if the method was called multiple times", function() {
                this.user.getWorkspaces();
                this.user.getWorkspaces();
                var spy = jasmine.createSpy("changeHandler");
                this.user.bind("change", spy);
                this.workspaces.trigger("reset");
                expect(spy.calls.length).toBe(1);
            });
        });

       context("when fetched", function() {
          beforeEach(function() {
              this.workspaces.fetch();
          });

          it("hits the right url for that user", function() {
            var expectedUrl = "/edc/workspace/?user=" + this.user.get("userName");
            expect(this.server.requests[0].url).toBe(expectedUrl);
          });
       });
    });
});
