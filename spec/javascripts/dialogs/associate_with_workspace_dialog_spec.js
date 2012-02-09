describe("chorus.dialogs.AssociateWithWorkspace", function() {
    beforeEach(function() {
        this.launchElement = $("<a></a>")
    });

    it("does not re-render when the model changes", function() {
        var dialog = new chorus.dialogs.AssociateWithWorkspace({launchElement : this.launchElement });
        expect(dialog.persistent).toBeTruthy()
    })

    describe("clicking Associate Dataset", function() {
        beforeEach(function() {
            this.pageModel = fixtures.datasetSourceTable();
            this.workspace = fixtures.workspace();
            this.dialog = new chorus.dialogs.AssociateWithWorkspace({launchElement : this.launchElement, pageModel: this.pageModel });
            this.dialog.render();

            spyOn(chorus, "toast");
            spyOn(this.dialog.picklistView, "selectedItem").andReturn(this.workspace);
            this.dialog.picklistView.trigger("item:selected", this.workspace);
            spyOn(chorus.router, "navigate")
            spyOn(this.dialog, "closeModal")
            this.dialog.$("button.submit").click();
        });

        it("calls the API", function() {
            expect(_.last(this.server.requests).url).toMatchUrl("/edc/workspace/" + this.workspace.get("id") + "/dataset");
            expect(_.last(this.server.requests).params()).toEqual({
                type: "SOURCE_TABLE",
                instanceId: this.pageModel.get("instance").id.toString(),

                databaseName: this.pageModel.get("databaseName"),
                schemaName: this.pageModel.get("schemaName"),
                objectName: this.pageModel.get("objectName"),
                objectType: this.pageModel.get("objectType")
            });
            expect(_.last(this.server.requests).method).toBe("POST");
        })

        describe("when the API is successful", function() {
            beforeEach(function() {
                this.server.lastCreate().succeed();
            })

            it("closes the dialog", function() {
                expect(this.dialog.closeModal).toHaveBeenCalled();
            });

            it("pops toast", function() {
                expect(chorus.toast).toHaveBeenCalledWith("dataset.associate.toast", {datasetTitle:this.pageModel.get("objectName"), workspaceNameTarget: this.workspace.get("name")});
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
                    "/edc/workspace/" + this.workspace.get("id") + "/dataset",
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
