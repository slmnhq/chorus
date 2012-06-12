describe("chorus.dialogs.AssociateMultipleWithWorkspace", function() {
    beforeEach(function() {
        this.databaseObjects = new chorus.collections.DatabaseObjectSet([
            rspecFixtures.databaseObject({ objectName: "one" }),
            rspecFixtures.databaseObject({ objectName: "two" }),
            rspecFixtures.databaseObject({ objectName: "three" })
        ]);

        this.dialog = new chorus.dialogs.AssociateMultipleWithWorkspace({
            databaseObjects: this.databaseObjects
        });
        this.dialog.render();
    });

    it("has the right button text", function() {
        expect(this.dialog.submitButtonTranslationKey).toBe("dataset.associate.button.other");
    });

    describe("when the workspaces are fetched and one is chosen", function() {
        beforeEach(function() {
            this.server.completeFetchAllFor(chorus.session.user().workspaces(), [
                rspecFixtures.workspace({ name: "abra", id: "11" }),
                rspecFixtures.workspace({ name: "cadabra", id: "12" })
            ]);

            this.dialog.$("li:eq(1)").click();
            this.dialog.$("button.submit").click();
        });

        it("sends a request to the 'associate dataset' API", function() {
            expect(this.server.lastCreate().url).toContain("/workspace/12/dataset");
            expect(this.server.lastCreate().params().type).toBe("SOURCE_TABLE");
        });

        it("sends all of the datasets' ids, separated by commas", function() {
            var expectedDatasetIds = this.databaseObjects.pluck("id").join(",");
            expect(this.server.lastCreate().params().datasetIds).toBe(expectedDatasetIds);
        });

        it("display loading message on the button", function() {
            expect(this.dialog.$("button.submit")).toHaveSpinner();
        });

        describe("when the request succeeds", function() {
            beforeEach(function() {
                spyOn(this.dialog, "closeModal");
                spyOn(chorus, "toast");
                this.server.lastCreate().succeed();
            });

            it("displays a toast message", function() {
                expect(chorus.toast).toHaveBeenCalledWith(
                    "dataset.associate.toast.other", { count: 3, workspaceNameTarget: "cadabra" }
                );
            });

            it("closes the dialog", function() {
                expect(this.dialog.closeModal).toHaveBeenCalled();
            });
        });
    });
});
