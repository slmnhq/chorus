describe("chorus.dialogs.CopyWorkfile", function() {
    beforeEach(function() {
        this.workspaceId = '4';
        this.workfileId = '10';
        this.launchElement = $("<a data-workspace-id='" + this.workspaceId + "' data-workfile-id='" + this.workfileId + "'></a>")
        this.workfile = fixtures.workfile({ id: this.workfileId, workspaceId: this.workspaceId });
        this.workspace = newFixtures.workspace({ id: this.workspaceId });
        setLoggedInUser({id: 4003});
        chorus.session.trigger("saved")

        this.dialog = new chorus.dialogs.CopyWorkfile({launchElement: this.launchElement });
        this.dialog.render();
    });

    describe("#setup", function() {
        it("fetches the source workfile", function() {
            expect(this.server.lastFetch().url).toBe("/workspace/4/workfile/10")
        })
    });

    describe("after the workfile and workspaces are fetched", function() {
        beforeEach(function() {
            this.workspace = newFixtures.workspace({ name: "me_neither" });

            this.server.completeFetchFor(this.workfile);
            this.server.completeFetchFor(chorus.session.user().workspaces(), [
                newFixtures.workspace({ name: "im_not_the_current_one'" }),
                this.workspace,
                newFixtures.workspace({ name: "yes_im_the_current_one", id: this.workspaceId })
            ]);
        });

        it("shows all of the user's workspaces except for the one that the workfile currently belongs to", function() {
            expect(this.dialog.$("li").length).toBe(2);
            expect(this.dialog.$('li:eq(0) .name')).toContainText("im_not_the_current_one");
            expect(this.dialog.$('li:eq(1) .name')).toContainText("me_neither");
        });

        it("has the right button text", function() {
            expect(this.dialog.$("button.submit")).toContainTranslation("workfile.copy_dialog.copy_file");
        });

        describe("clicking Copy File", function() {
            beforeEach(function() {
                spyOn(chorus, "toast");
                spyOn(chorus.router, "navigate")
                spyOn(this.dialog, "closeModal")

                this.dialog.workfile = this.workfile;
                this.dialog.render();

                this.dialog.$("li:eq(1)").click();
                this.dialog.$("button.submit").click();
            });

            it("calls the API", function() {
                expect(_.last(this.server.requests).url).toBe("/workspace/" + this.workspace.get("id") + "/workfile");
                expect(_.last(this.server.requests).method).toBe("POST");
            })

            describe("when the workfile contains a description", function() {
                beforeEach(function() {
                    this.workfile.set({ description: "my workfile" });
                    this.dialog.$("button.submit").click();
                })

                it("includes the description in the API call", function() {
                    expect(_.last(this.server.requests).requestBody).toContain("description=my+workfile");
                })
            })

            describe("when the workfile does not contain a description", function() {
                beforeEach(function() {
                    this.workfile.unset("description");
                    this.dialog.$("button.submit").click();
                })

                it("does not include the description in the API call", function() {
                    expect(_.last(this.server.requests).requestBody).not.toContain("description=my+workfile");
                })
            });

            describe("when the API is successful", function() {
                beforeEach(function() {
                    this.workfile.set({"fileName": "copied_filename.sql" })
                    this.server.lastCreate().succeed(this.workfile.attributes);
                })

                it("closes the dialog", function() {
                    expect(this.dialog.closeModal).toHaveBeenCalled();
                });

                it("pops toast", function() {
                    expect(chorus.toast).toHaveBeenCalledWith("workfile.copy_dialog.toast", {
                        workfileTitle: this.workfile.get("fileName"),
                        workspaceNameTarget: this.workspace.get("name")
                    });
                });

                it("does not navigate", function() {
                    expect(chorus.router.navigate).not.toHaveBeenCalled();
                });
            })

            describe("when the API fails", function() {
                beforeEach(function() {
                    this.dialog.closeModal.reset();
                    this.server.lastCreate().failUnprocessableEntity([{
                        "message": "Workspace already has a workfile with this name. Specify a different name."
                    }]);
                })

                it("does not close the dialog", function() {
                    expect(this.dialog.closeModal).not.toHaveBeenCalled();
                })

                it("does not pop toast", function() {
                    expect(chorus.toast).not.toHaveBeenCalled();
                });

                it("displays the server error message", function() {
                    expect(this.dialog.$(".errors ul").text().trim()).toBe("Workspace already has a workfile with this name. Specify a different name.")
                })
            })
        });
    });
})
