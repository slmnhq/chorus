describe("chorus.dialogs.AssociateWithWorkspace", function() {
    beforeEach(function() {
        this.launchElement = $("<a></a>")
    });

    describe("after workspaces are fetched", function() {
        context("when the model is a source table/view with multiple workspaces", function() {
            beforeEach(function() {
                this.model = newFixtures.databaseObject({workspaceUsed: {
                    workspaceCount: 2,
                    workspaceList: [
                        {id: "123", name: "im_also_the_current_one"},
                        {id: "645", name: "yes_im_the_current_one"}
                    ]
                }});

                this.dialog = new chorus.dialogs.AssociateWithWorkspace({launchElement: this.launchElement, model: this.model });
                this.server.completeFetchFor(chorus.session.user().workspaces(), [
                    newFixtures.workspace({ name: "im_also_the_current_one'", id: "123" }),
                    newFixtures.workspace({ name: "im_not_the_current_one" }),
                    newFixtures.workspace({ name: "yes_im_the_current_one", id: "645" })
                ]);
            });

            it("shows all workspaces except for the ones the source table is already associated with", function() {
                expect(this.dialog.$("li").length).toBe(1);
                expect(this.dialog.$('li:eq(0) .name')).toContainText("im_not_the_current_one");
            });
        });

        context("when the model is a source table/view with no workspaces", function() {
            beforeEach(function() {
                this.model = newFixtures.dataset.sourceTable();
                this.model.unset("workspaceUsed");
                this.dialog = new chorus.dialogs.AssociateWithWorkspace({launchElement: this.launchElement, model: this.model });
                this.server.completeFetchFor(chorus.session.user().workspaces(), [
                    newFixtures.workspace({ name: "im_not_the_current_one'" }),
                    newFixtures.workspace({ name: "me_neither" }),
                    newFixtures.workspace({ name: "yes_im_the_current_one", id: "645" })
                ]);
            });

            it("shows all workspaces", function() {
                expect(this.dialog.$("li").length).toBe(3);
                expect(this.dialog.$('li:eq(0) .name')).toContainText("im_not_the_current_one");
                expect(this.dialog.$('li:eq(1) .name')).toContainText("me_neither");
                expect(this.dialog.$('li:eq(2) .name')).toContainText("yes_im_the_current_one");
            });
        });
        context("when the model is a sandbox table/view or a chorus view (in a workspace)", function() {
            beforeEach(function() {
                this.model = newFixtures.dataset.sandboxTable({workspace: {id: "645"}});
                this.dialog = new chorus.dialogs.AssociateWithWorkspace({launchElement: this.launchElement, model: this.model });
                this.server.completeFetchFor(chorus.session.user().workspaces(), [
                    newFixtures.workspace({ name: "im_not_the_current_one'" }),
                    newFixtures.workspace({ name: "me_neither" }),
                    newFixtures.workspace({ name: "yes_im_the_current_one", id: "645" })
                ]);
            });

            it("it shows all workspaces except for the current workspace", function() {
                expect(this.dialog.$("li").length).toBe(2);
                expect(this.dialog.$('li:eq(0) .name')).toContainText("im_not_the_current_one");
                expect(this.dialog.$('li:eq(1) .name')).toContainText("me_neither");
            });
        });
    });

    describe("clicking Associate Dataset", function() {
        context("for anything except a Chorus View", function() {
            beforeEach(function() {
                this.model = newFixtures.dataset.sandboxTable();
                this.workspace = newFixtures.workspace({ name: "im_not_the_current_one" });

                this.dialog = new chorus.dialogs.AssociateWithWorkspace({launchElement: this.launchElement, model: this.model });
                this.server.completeFetchFor(chorus.session.user().workspaces(), [
                    newFixtures.workspace({ name: "im_also_the_current_one'", id: "123" }),
                    this.workspace,
                    newFixtures.workspace({ name: "yes_im_the_current_one", id: "645" })
                ]);

                spyOn(chorus.router, "navigate");
                spyOn(chorus, "toast");
                spyOn(this.dialog, "closeModal");

                this.dialog.render();
                spyOn(this.model.activities(), "fetch");
                this.dialog.$('li:eq(1)').click();
                this.dialog.$("button.submit").click();
            });

            it("calls the API for associating new source tables with a workspace", function() {
                expect(_.last(this.server.requests).url).toMatchUrl("/workspace/" + this.workspace.get("id") + "/dataset");
                expect(_.last(this.server.requests).params()).toEqual({
                    type: "SOURCE_TABLE",
                    datasetIds: this.model.id
                });
                expect(_.last(this.server.requests).method).toBe("POST");
            });

            it("starts loading", function() {
                expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
                expect(this.dialog.$("button.submit").text()).toMatchTranslation("actions.associating");
            });

            describe("when the API is successful", function() {
                beforeEach(function() {
                    spyOn(chorus.PageEvents, "broadcast");
                    this.server.lastCreate().succeed();
                });

                it("closes the dialog", function() {
                    expect(this.dialog.closeModal).toHaveBeenCalled();
                });

                it("pops toast", function() {
                    expect(chorus.toast).toHaveBeenCalledWith("dataset.associate.toast.one", {datasetTitle: this.model.get("objectName"), workspaceNameTarget: this.workspace.get("name")});
                });

                it("does not navigate", function() {
                    expect(chorus.router.navigate).not.toHaveBeenCalled();
                });

                it("fetch the activities for the dataset", function() {
                    expect(this.model.activities().fetch).toHaveBeenCalled();
                });

                it("broadcasts workspace:associated without arguments", function() {
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("workspace:associated");
                });
            });

            describe("when the API fails", function() {
                beforeEach(function() {
                    this.dialog.closeModal.reset();
                    this.server.lastRequest().failUnprocessableEntity({ fields: { a: { REQUIRED: {} } } });
                });

                it("does not close the dialog", function() {
                    expect(this.dialog.closeModal).not.toHaveBeenCalled();
                });

                it("does not pop toast", function() {
                    expect(chorus.toast).not.toHaveBeenCalled();
                });

                it("stops loading", function() {
                    expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
                });

                it("displays the server error message", function() {
                    expect(this.dialog.$(".errors ul").text().trim()).toBe("A is required")
                });
            });
        });

        context("when the dataset is a Chorus View", function() {
            beforeEach(function() {
                this.currentWorkspace = newFixtures.workspace({ name: "im_also_the_current_one'", id: "987" });
                this.workspace = newFixtures.workspace({ name: "im_not_the_current_one", id: "123"});
                this.model = newFixtures.dataset.chorusView({ workspace: { id: "987" } });

                this.dialog = new chorus.dialogs.AssociateWithWorkspace({launchElement: this.launchElement, model: this.model });
                this.dialog.render();

                this.server.completeFetchFor(chorus.session.user().workspaces(), [
                    this.currentWorkspace,
                    this.workspace,
                    newFixtures.workspace({ name: "yes_im_the_current_one", id: "645" })
                ]);

                spyOn(chorus, "toast");
                spyOn(this.model.activities(), "fetch");
                spyOn(chorus.router, "navigate");
                spyOn(this.dialog, "closeModal");

                this.dialog.$("li:eq(0)").click();
                this.dialog.$("button.submit").click();
            });

            it("calls the API", function() {
                expect(_.last(this.server.requests).url).toMatchUrl("/workspace/987/dataset/" + this.model.get("id"));
                expect(_.last(this.server.requests).params()).toEqual({
                    targetWorkspaceId: this.workspace.get("id"),
                    objectName: this.model.get("objectName")
                });
                expect(_.last(this.server.requests).method).toBe("POST");
            });
        });
    });
});
