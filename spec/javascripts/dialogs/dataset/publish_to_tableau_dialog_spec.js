describe("chorus.dialogs.PublishToTableauDialog", function () {
    beforeEach(function () {
        this.dataset = rspecFixtures.workspaceDataset.datasetTable({objectName:"myDataset"});
        this.model = this.dataset.deriveTableauWorkbook();
        this.dialog = new chorus.dialogs.PublishToTableau({model:this.model});
        this.dialog.render();
    });

    it("populates the dataset name in the name input", function () {
        expect(this.dialog.$("input[name='name']").val()).toBe("myDataset");
    });

    describe("when publish is clicked", function () {
        beforeEach(function () {
            this.dialog.$("input[name='name']").val("foo");
            this.dialog.$("button.submit").click();
        });

        it("sets the name on the workbook", function () {
            expect(this.model.name()).toBe("foo");
        });

        it("saves the workbook", function() {
            expect(this.server.lastCreateFor(this.model)).toBeDefined();
        });

        it("start the spinner on the button", function() {
           expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
        });

        describe("when the save succeeds", function() {
           beforeEach(function() {
               spyOn(chorus.Modal.prototype, "closeModal");
               spyOn(chorus, "toast");
              this.server.lastCreateFor(this.model).succeed();
           });

           it("closes the modal", function() {
               expect(this.dialog.closeModal).toHaveBeenCalled();
           });

            it("toasts", function() {
                expect(chorus.toast).toHaveBeenCalledWith(
                    "tableau.published", {
                        objectType: "Source Table",
                        objectName: "myDataset",
                        name: "foo"
                    }
                );
            });
        });

        describe("when the save fails", function() {
            beforeEach(function() {
                this.server.lastCreateFor(this.model).failUnprocessableEntity();
            });

            it("stops the spinner", function() {
               expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
            });
        });

    });
});