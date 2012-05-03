describe("chorus.views.UserShow", function() {
    describe("#render", function() {
        beforeEach(function() {
            this.model = newFixtures.user({
                email: "a@b.com",
                title: "My Title",
                dept: "My Department",
                admin: true,
                username: "gabe1",
                notes: "My Notes"
            });
            var workspaces = new chorus.collections.WorkspaceSet();
            spyOn(workspaces, "fetch");
            workspaces.add(new chorus.models.Workspace({id: 1, name: "ws1"}));
            workspaces.add(new chorus.models.Workspace({id: 2, name: "ws2"}));
            this.model.workspaces = function(){
              return workspaces;
            };
            this.view = new chorus.views.UserShow({model: this.model});
        });

        context("before render is called", function(){
            it("does not call .fetch on workspaces", function(){
                expect(this.model.workspaces().fetch.calls.length).toBe(0);
            });
        });

        context("after render has been called", function(){
            beforeEach(function(){
                this.view.render();
            });

            it("renders a profile image for the user", function() {
                var image = this.view.$(".edit_photo img");
                var username = this.model.get("username");
                expect(image.attr('src').indexOf(this.model.fetchImageUrl())).toBe(0);
            });

            it("renders the title text", function() {
                expect(this.view.$(".title").text()).toBe(this.model.get("title"));
            });

            it("renders the department text", function() {
                expect(this.view.$(".department").text()).toBe(this.model.get("dept"));
            });

            it("renders the email text", function() {
                expect(this.view.$(".email").text()).toBe(this.model.get("email"));
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

            it("sets title attributes on the workspace names", function() {
                expect(this.view.$(".workspaces li a").eq(0).attr("title")).toBe('ws1');
                expect(this.view.$(".workspaces li a").eq(1).attr("title")).toBe('ws2');
            })

            it("renders the workspaces with the correct hrefs", function() {
              expect(this.view.$(".workspaces li a").eq(0).attr('href')).toBe('#/workspaces/1');
              expect(this.view.$(".workspaces li a").eq(1).attr('href')).toBe('#/workspaces/2');
            });

            it("renders the workspaces images", function() {
                expect(this.view.$(".workspaces li img").eq(0).attr('src')).toBe('/images/workspaces/workspace_small.png');
                expect(this.view.$(".workspaces li img").eq(1).attr('src')).toBe('/images/workspaces/workspace_small.png');
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
                    expect(this.model.workspaces().fetch.calls.length).toBe(1);
                });
            });

            context("when the user has no workspaces", function() {
                beforeEach(function() {
                    var workspaces = new chorus.collections.WorkspaceSet();
                    this.model.workspaces = function(){
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
