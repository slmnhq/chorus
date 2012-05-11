describe("chorus.dialogs.DatasetDownload", function() {
    beforeEach(function() {
        this.dataset = newFixtures.dataset.sandboxTable();
        spyOn(this.dataset, 'download');
        this.dialog = new chorus.dialogs.DatasetDownload({ pageModel: this.dataset });
        this.dialog.render();
    });

    describe("#render", function() {
        var radioButtonSpecify, radioButtonAll;
        beforeEach(function() {
            radioButtonSpecify = this.dialog.$("input[type=radio][id=specify_rows]");
            radioButtonAll = this.dialog.$("input[type=radio][id=all_rows]");
            this.rowsInput = this.dialog.$("input[name=numOfRows][type=text]");
            this.submitButton = this.dialog.$("button.submit");
        });

        it("has the right title", function(){
            expect(this.dialog.$("h1").text()).toMatchTranslation("dataset.download.title", {datasetName: this.dataset.name()})
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

        describe("validations", function() {
            beforeEach(function() {
                spyOnEvent($(document), "close.facebox");
                spyOn(this.dialog, "showErrors").andCallThrough();
            });

            context("entering a negative number", function() {
                beforeEach(function() {
                    this.rowsInput.val("-100");
                    this.submitButton.click();
                });

                it("does not start a dataset download", function() {
                    expect(this.dataset.download).not.toHaveBeenCalled();
                });

                it("does not dismiss the dialog", function() {
                    expect("close.facebox").not.toHaveBeenTriggeredOn($(document));
                });

                it("displays an error", function() {
                    expect(this.rowsInput).toHaveClass("has_error");
                    expect(this.dialog.$(".has_error").length).toBe(1);
                    expect(this.dialog.showErrors).toHaveBeenCalled();
                });
            });

            context("entering a string", function() {
                beforeEach(function() {
                    this.rowsInput.val("hello!");
                    this.submitButton.click();
                });

                it("does not start a dataset download", function() {
                    expect(this.dataset.download).not.toHaveBeenCalled();
                });

                it("does not dismiss the dialog", function() {
                    expect("close.facebox").not.toHaveBeenTriggeredOn($(document));
                });

                it("displays an error", function() {
                    expect(this.rowsInput).toHaveClass("has_error");
                    expect(this.dialog.$(".has_error").length).toBe(1);
                    expect(this.dialog.showErrors).toHaveBeenCalled();
                });
            });
        });

        describe("checking the 'all rows' box and clicking download", function() {
            beforeEach(function() {
                radioButtonSpecify.prop("checked", false);
                radioButtonAll.prop("checked", true);
                this.submitButton.click();
                spyOnEvent($(document), "close.facebox");
            });

            it("starts a dataset download of all rows", function() {
                expect(this.dataset.download).toHaveBeenCalledWith(/* should be called w/ no args */);
            });

            it("dismisses the dialog", function() {
                expect("close.facebox").toHaveBeenTriggeredOn($(document));
            });
        });
    });
});
