describe("chorus.dialogs.AssociateWithWorkspace", function() {
    beforeEach(function() {
        this.launchElement = $("<a></a>")
    });

    it("does not re-render when the model changes", function() {
        var dialog = new chorus.dialogs.AssociateWithWorkspace({launchElement : this.launchElement, model: fixtures.datasetSourceTable() });
        expect(dialog.persistent).toBeTruthy()
    })

    describe("intialization", function() {
        it("should complain if it isn't given a model", function() {
            expect(function() {
                new chorus.dialogs.AssociateWithWorkspace({launchElement : this.launchElement });
            }).toThrow();
        });
    });

    describe("clicking Associate Dataset", function() {
        beforeEach(function() {
            this.model = fixtures.datasetSourceTable();
            this.workspace = fixtures.workspace();
            this.dialog = new chorus.dialogs.AssociateWithWorkspace({launchElement : this.launchElement, model: this.model });
            this.dialog.render();

            spyOn(chorus, "toast");
            spyOn(this.model.activities(), "fetch");
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
                instanceId: this.model.get("instance").id.toString(),

                databaseName: this.model.get("databaseName"),
                schemaName: this.model.get("schemaName"),
                objectName: this.model.get("objectName"),
                objectType: this.model.get("objectType")
            });
            expect(_.last(this.server.requests).method).toBe("POST");
        })

        it("starts loading", function() {
            expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
            expect(this.dialog.$("button.submit").text()).toMatchTranslation("actions.associating");
        })

        describe("when the API is successful", function() {
            beforeEach(function() {
                this.server.lastCreate().succeed();
            })

            it("closes the dialog", function() {
                expect(this.dialog.closeModal).toHaveBeenCalled();
            });

            it("pops toast", function() {
                expect(chorus.toast).toHaveBeenCalledWith("dataset.associate.toast", {datasetTitle:this.model.get("objectName"), workspaceNameTarget: this.workspace.get("name")});
            });

            it("does not navigate", function() {
                expect(chorus.router.navigate).not.toHaveBeenCalled();
            });

            it("fetch the activities for the dataset", function() {
                expect(this.model.activities().fetch).toHaveBeenCalled();
            });
        })

        describe("when the API fails", function() {
            beforeEach(function() {
                this.server.lastRequest().fail([
                    {
                        "message": "Workspace already has a workfile with this name. Specify a different name."
                    }
                ])
            })

            it("does not close the dialog", function() {
                expect(this.dialog.closeModal).not.toHaveBeenCalled();
            })

            it("does not pop toast", function() {
                expect(chorus.toast).not.toHaveBeenCalled();
            });

            it("stops loading", function() {
                expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
            })

            it("displays the server error message", function() {
                expect(this.dialog.$(".errors ul").text().trim()).toBe("Workspace already has a workfile with this name. Specify a different name.")
            })
        })
    });
})
