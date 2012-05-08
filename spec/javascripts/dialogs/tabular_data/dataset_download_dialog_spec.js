describe("chorus.dialogs.DatasetDownload", function() {
    beforeEach(function() {
        this.dataset = newFixtures.dataset.sandboxTable();
        spyOn(this.dataset, 'download');
        this.dialog = new chorus.dialogs.DatasetDownload({ model: this.dataset });
        this.dialog.render();
    });

    describe("#render", function() {
        var radioButtonSpecify, radioButtonAll;
        beforeEach(function() {
            radioButtonSpecify = this.dialog.$("input[type=radio][id=specify_rows]");
            radioButtonAll = this.dialog.$("input[type=radio][id=all_rows]");
            this.rowsInput = this.dialog.$("input[name=rows][type=text]");
            this.submitButton = this.dialog.$("button.submit");
        });

        it("has the right title", function(){
            expect(this.dialog.$("h1").text()).toMatchTranslation("dataset.download.title")
        });

        it("has two radio buttons", function(){
            expect(radioButtonSpecify.length).toBe(1);
            expect(radioButtonAll.length).toBe(1);
        });

        it("the first option is 'x rows', checked by default", function(){
            expect(radioButtonSpecify).toBeChecked();
            expect(this.dialog.$("label[for=specify_rows]")).toContainTranslation("dataset.download.specify_rows");
            expect(this.rowsInput).toExist();
        });

        it("the second option is 'all rows'", function(){
            expect(radioButtonAll).toHaveId("all_rows");
            expect(this.dialog.$("label[for=all_rows]")).toContainTranslation("dataset.download.all_rows");
        });

        it("has the right text in the submit button", function() {
            expect(this.submitButton).toContainTranslation("actions.download");
        });

        describe("entering a number of rows and clicking 'download'", function() {
            beforeEach(function() {
                this.rowsInput.val("473");
                this.submitButton.click();
            });

            it("starts a dataset download", function() {
                expect(this.dataset.download).toHaveBeenCalledWith({ rows: "473" });
            });
        });

        describe("checking the 'all rows' box and clicking download", function() {
            beforeEach(function() {
                radioButtonSpecify.prop("checked", false);
                radioButtonAll.prop("checked", true);
                this.submitButton.click();
            });

            it("starts a dataset download of all rows", function() {
                expect(this.dataset.download).toHaveBeenCalledWith(/* should be called w/ no args */);
            });
        });
    });
});
