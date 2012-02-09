describe("chorus.dialogs.CopyWorkfile", function() {
    beforeEach(function() {
        this.launchElement = $("<a data-workspace-id='4' data-workfile-id='10'></a>")
    });

    it("does not re-render when the model changes", function() {
        var dialog = new chorus.dialogs.CopyWorkfile({launchElement : this.launchElement });
        expect(dialog.persistent).toBeTruthy()
    })

    describe("#setup", function() {
        beforeEach(function() {
            setLoggedInUser({id: 4003});
            chorus.session.trigger("saved")
            this.dialog = new chorus.dialogs.CopyWorkfile({launchElement : this.launchElement });
        })

        it("fetches the source workfile", function() {
            expect(this.server.requests[1].url).toBe("/edc/workspace/4/workfile/10")
        })
    })

    describe("clicking Copy File", function() {
        beforeEach(function() {
            this.workspace = fixtures.workspace();
            this.workfile = fixtures.workfile({workspaceId: this.workspace.get('id')});
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
        })
        describe("when the API is successful", function() {
            beforeEach(function() {
                this.server.lastCreate().succeed(this.workfile.attributes);
            })

            it("closes the dialog", function() {
                expect(this.dialog.closeModal).toHaveBeenCalled();
            });

            it("pops toast", function() {
                expect(chorus.toast).toHaveBeenCalledWith("workfile.copy_dialog.toast", {workfileTitle:"Workfile 10", workspaceNameTarget:"Workspace 2"});
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
