describe("chorus.views.UserShow", function() {
    beforeEach(function() {
        this.loadTemplate("user_show");
    });

    describe("#render", function() {
        beforeEach(function() {
            this.model = new chorus.models.User({
                emailAddress: "a@b.com",
                title: "My Title",
                department: "My Department",
                admin: true,
                userName: "gabe1",
                notes: "My Notes"
            });
            var workspaces = new chorus.models.WorkspaceSet();
            workspaces.add(new chorus.models.Workspace({name: "ws1"}));
            workspaces.add(new chorus.models.Workspace({name: "ws2"}));
            this.model.getWorkspaces = function(){
              return workspaces;
            }
            this.view = new chorus.views.UserShow({model: this.model});
            this.view.render();
        });

        it("renders a profile image for the user", function() {
            var image = this.view.$(".edit_photo img");
            var userName = this.model.get("userName");
            expect(image.attr('src')).toBe("/edc/userimage/" + userName + "?size=profile");
        });

        it("renders the title text", function() {
            expect(this.view.$(".title").text()).toBe(this.model.get("title"));
        });

        it("renders the department text", function() {
            expect(this.view.$(".department").text()).toBe(this.model.get("department"));
        });

        it("renders the email text", function() {
            expect(this.view.$(".emailAddress").text()).toBe(this.model.get("emailAddress"));
        });

        it("renders administrator", function() {
            expect(this.view.$(".administrator")).toExist();
        });

        it("renders the user's notes", function() {
            expect(this.view.$(".notes").text()).toBe(this.model.get("notes"));
        });

        it("renders all of the workspaces", function(){
          expect(this.view.$(".workspaces li").length).toBe(2);
        });

        it("renders the workspaces' names'", function(){
          expect(this.view.$(".workspaces li").eq(0).text()).toBe('ws1');
          expect(this.view.$(".workspaces li").eq(1).text()).toBe('ws2');
        });

        context("When the user is not the administrator", function() {
            beforeEach(function() {
                this.model.set({admin: false});
            });

            it("does not render administrator", function() {
                expect(this.view.$(".administrator")).not.toExist();
            });
        });
    });
});
