describe("chorus.views.UserShow", function() {
    beforeEach(function() {
        this.loadTemplate("user_show");
    });

    describe("#render", function() {
        beforeEach(function() {
            this.model = new chorus.models.User({
                emailAddress: "a@b.com",
                title: "My Title",
                ou: "My Department",
                admin: true,
                userName: "gabe1",
                notes: "My Notes"
            });
            var workspaces = new chorus.models.WorkspaceSet();
            spyOn(workspaces, "fetch");
            workspaces.add(new chorus.models.Workspace({id: 1, name: "ws1"}));
            workspaces.add(new chorus.models.Workspace({id: 2, name: "ws2"}));
            this.model.getWorkspaces = function(){
              return workspaces;
            };
            this.view = new chorus.views.UserShow({model: this.model});
        });

        context("before render is called", function(){
            it("does not call .fetch on workspaces", function(){
                expect(this.model.getWorkspaces().fetch.calls.length).toBe(0);
            });
        });

        context("after render has been called", function(){
            beforeEach(function(){
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
                expect(this.view.$(".department").text()).toBe(this.model.get("ou"));
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

            it("renders the workspaces with the correct hrefs", function() {
              expect(this.view.$(".workspaces li a").eq(0).attr('href')).toBe('#/workspaces/1');
              expect(this.view.$(".workspaces li a").eq(1).attr('href')).toBe('#/workspaces/2');
            });

            context("When the user is not the administrator", function() {
                       beforeEach(function() {
                           this.model.set({admin: false}, {silent : true});
                           this.view.render();
                       });
            
                it("does not render administrator", function() {
                    expect(this.view.$(".administrator")).not.toExist();
                });
            });

            context("when the view changes and re-renders several times before workspaces is fetched", function(){
                beforeEach(function(){
                    this.view.render();
                    this.view.render();
                    this.view.render();
                });
                it("fetches the user's workspaces exactly once", function() {
                    expect(this.model.getWorkspaces().fetch.calls.length).toBe(1);
                });
            });

            context("when the user has no workspaces", function() {
                beforeEach(function() {
                    var workspaces = new chorus.models.WorkspaceSet();
                    this.model.getWorkspaces = function(){
                        return workspaces;
                    };
                    this.view.render();
                });

                it("it hides the workspaces column", function() {
                    expect(this.view.$(".workspaces")).toHaveClass('hidden');
                });
            });
        });
    });
});
