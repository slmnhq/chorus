describe("chorus.dialogs.PickWorkspace", function() {
    beforeEach(function() {
        setLoggedInUser({id: 4003});
        chorus.session.trigger("saved")
        this.launchElement = $("<a></a>");
        this.dialog = new chorus.dialogs.PickWorkspace({launchElement: this.launchElement});
    });

    describe("#setup", function() {
        it("fetches all the workspaces", function() {
            expect(this.server.lastFetch().url).toBe("/edc/workspace/?user=4003&page=1&rows=1000");
        })

        it("only gets the chorus.session.users()'s workspaces", function() {
            expect(this.dialog.collection.attributes.userId).toBe(chorus.session.user().get("id"));
        })

        context("when the launch element activeOnly is set to true", function() {
            beforeEach(function() {
                this.launchElement.data('activeOnly', true);
                this.dialog = new chorus.dialogs.PickWorkspace({launchElement: this.launchElement});
            });

            it("only fetches the active workspaces", function() {
                expect(this.dialog.collection.attributes.active).toBeTruthy();
            });
        });

        context("when options.activeOnly is set to true", function() {
            beforeEach(function() {
                this.dialog = new chorus.dialogs.PickWorkspace({launchElement: this.launchElement, activeOnly: true});
            });

            it("only fetches the active workspaces", function() {
                expect(this.dialog.collection.attributes.active).toBeTruthy();
            });
        });
    })

    describe("#render", function() {
        beforeEach(function() {
            this.dialog = new chorus.dialogs.PickWorkspace({launchElement: this.launchElement});
            this.dialog.render();
        })

        context("when the fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchAllFor(this.dialog.collection, [
                    newFixtures.workspace({name: "Foo"}),
                    newFixtures.workspace({name: "Bar"}),
                    newFixtures.workspace({name: "Baz"})
                ]);
            });

            it("has the correct submit button text", function() {
                expect(this.dialog.$("button.submit")).toContainTranslation("dataset.associate.button");
            });

            it("renders the name of the workspace", function() {
                expect(this.dialog.$("li").length).toBe(3);
                expect(this.dialog.$("li:eq(0)")).toContainText("Bar");
                expect(this.dialog.$("li:eq(1)")).toContainText("Baz");
                expect(this.dialog.$("li:eq(2)")).toContainText("Foo");
            });

            it("renders the workspace icon", function() {
                expect(this.dialog.$("li:eq(0) img")).toHaveAttr("src", "/images/workspaces/workspace_small.png");
                expect(this.dialog.$("li:eq(1) img")).toHaveAttr("src", "/images/workspaces/workspace_small.png");
                expect(this.dialog.$("li:eq(2) img")).toHaveAttr("src", "/images/workspaces/workspace_small.png");
            });

            describe("clicking the choose workspace button", function() {
                beforeEach(function() {
                    this.dialog.callback = jasmine.createSpy("callback");
                    this.dialog.$("li:eq(0)").click();
                    this.dialog.$("button.submit").click();
                });

                it("calls the callback", function() {
                    expect(this.dialog.callback).toHaveBeenCalled();
                })
            });

            describe("double-clicking a workspace", function() {
                beforeEach(function() {
                    this.dialog.callback = jasmine.createSpy("callback");
                    this.dialog.$("li:eq(0)").dblclick();
                });

                it("calls the callback", function() {
                    expect(this.dialog.callback).toHaveBeenCalled();
                });
            });
        });
    });
});
