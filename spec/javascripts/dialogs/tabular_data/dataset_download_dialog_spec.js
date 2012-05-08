describe("chorus.dialogs.DatasetDownload", function() {
    beforeEach(function() {
        this.dataset = newFixtures.dataset.sandboxTable();
        spyOn(this.dataset, 'download');
        this.dialog = new chorus.dialogs.DatasetDownload({ model: this.dataset });
        this.dialog.render();
    });

    describe("#render", function() {
        beforeEach(function() {
            this.radioButtons = this.dialog.$("input[type=radio]");
            this.rowsInput = this.dialog.$("input[name=rows][type=text]");
            this.submitButton = this.dialog.$("button.submit");
        });

        it("has the right title", function(){
            expect(this.dialog.$("h1").text()).toMatchTranslation("dataset.download.title")
        });

        it("has two radio buttons", function(){
            expect(this.radioButtons.length).toBe(2);
        });

        it("the first option is 'x rows', checked by default", function(){
            expect(this.radioButtons.eq(0)).toBe(":checked");
            expect(this.dialog.$("label[for=specify_rows]")).toContainTranslation("dataset.download.specify_rows");
            expect(this.rowsInput).toExist();
        });

        it("the second option is 'all rows'", function(){
            expect(this.radioButtons.eq(1)).toHaveId("all_rows");
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
                this.radioButtons.eq(0).prop("checked", false);
                this.radioButtons.eq(1).prop("checked", true);
                this.submitButton.click();
            });

            it("starts a dataset download of all rows", function() {
                expect(this.dataset.download).toHaveBeenCalledWith(/* should be called w/ no args */);
            });
        });
    });
});
