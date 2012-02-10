describe("chorus.dialogs.CopyWorkfile", function() {
    beforeEach(function() {
        this.workspaceId = '4';
        this.workfileId = '10';
        this.launchElement = $("<a data-workspace-id='" + this.workspaceId + "' data-workfile-id='" + this.workfileId + "'></a>")
        this.workfile = fixtures.workfile({ id: this.workfileId, workspaceId: this.workspaceId });
        this.workspace = fixtures.workspace({ id: this.workspaceId });
        setLoggedInUser({id: 4003});
        chorus.session.trigger("saved")
        this.dialog = new chorus.dialogs.CopyWorkfile({launchElement : this.launchElement });
    });

    it("does not re-render when the model changes", function() {
        expect(this.dialog.persistent).toBeTruthy()
    })

    describe("#setup", function() {
        it("fetches the source workfile", function() {
            expect(this.server.requests[1].url).toBe("/edc/workspace/4/workfile/10")
        })
    });

    describe("after the workfile and workspaces are fetched", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.workfile);
            this.server.completeFetchFor(chorus.session.user().workspaces(), [
                fixtures.workspace({ name: "im_not_the_current_one'" }),
                fixtures.workspace({ name: "me_neither" }),
                fixtures.workspace({ name: "yes_im_the_current_one", id: this.workspaceId })
            ]);
        });

        it("shows all of the user's workspaces except for the one that the workfile currently belongs to", function() {
            expect(this.dialog.$('.collection_picklist li span.name')).toContainText("me_neither");
            expect(this.dialog.$('.collection_picklist li span.name')).toContainText("im_not_the_current_one");
            expect(this.dialog.$('.collection_picklist li span.name')).not.toContainText("yes_im_the_current_one");
        });
    });

    describe("clicking Copy File", function() {
        beforeEach(function() {
            this.dialog = new chorus.dialogs.CopyWorkfile({launchElement : this.launchElement });
            this.dialog.workfile = this.workfile;
            this.dialog.render();

            spyOn(chorus, "toast");
            spyOn(this.dialog.picklistView, "selectedItem").andReturn(this.workspace);
            this.dialog.picklistView.trigger("item:selected", this.workspace);
            spyOn(chorus.router, "navigate")
            spyOn(this.dialog, "closeModal")
            this.dialog.$("button.submit").click();
        });

        it("calls the API", function() {
            expect(_.last(this.server.requests).url).toBe("/edc/workspace/" + this.workspace.get("id") + "/workfile");
            expect(_.last(this.server.requests).method).toBe("POST");
        })

        describe("when the workfile contains a description", function() {
            beforeEach(function() {
                this.workfile.set({ description : "my workfile" });
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

                fixtures.model = "Workfile";
                this.server.respondWith(
                    'POST',
                    "/edc/workspace/" + this.workspace.get("id") + "/workfile",
                    this.prepareResponse(fixtures.jsonFor("copyFailed")));

                this.server.respond();
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
})
