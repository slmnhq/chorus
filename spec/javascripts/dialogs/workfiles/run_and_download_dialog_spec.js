describe("chorus.dialogs.RunAndDownload", function() {
    beforeEach(function() {
        chorus.page = { workspace: rspecFixtures.workspace({ id: 999 }) };
        this.workfile = rspecFixtures.workfile.sql({ fileType: "SQL", workspace: {
            id: chorus.page.workspace.get("id")
        }});
        this.dialog = new chorus.dialogs.RunAndDownload({ pageModel: this.workfile });
    });

    it("does not re-render when the model changes", function() {
        expect(this.dialog.persistent).toBeTruthy()
    });

    describe("#render", function() {
        var radioButtonSpecify, radioButtonAll, submitButton, rowsInput;
        beforeEach(function() {
            this.dialog.render();

            radioButtonSpecify = this.dialog.$("input[type=radio][id=specify_rows]");
            radioButtonAll = this.dialog.$("input[type=radio][id=all_rows]");
            submitButton = this.dialog.$("button.submit");
            rowsInput = this.dialog.$("input[name=rowLimit][type=text]");
            spyOn(chorus.PageEvents, 'broadcast');
            spyOnEvent($(document), "close.facebox");
        });

        it("has the right title", function() {
            expect(this.dialog.$(".dialog_header h1")).toContainTranslation("workfile.run_and_download_dialog.title");
        });

        it("has a Run button", function() {
            expect(this.dialog.$("button.submit").text().trim()).toMatchTranslation("workfile.run_and_download_dialog.run")
        });

        context("for all rows", function() {
            beforeEach(function() {
                radioButtonSpecify.prop("checked", false);
                radioButtonAll.prop("checked", true);
            });

            context("clicking submit", function() {
                beforeEach(function() {
                    submitButton.click();
                });

                it("broadcasts the file:runAndDownload event", function() {
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:runAndDownload");
                });

                it("dismisses the dialog", function() {
                    expect("close.facebox").toHaveBeenTriggeredOn($(document));
                });
            });
        });

        context("for select rows", function() {
            beforeEach(function() {
                rowsInput.val("867");
            });

            context("clicking submit", function() {
                beforeEach(function() {
                    submitButton.click();
                });

                it("broadcasts the file:runAndDownload event and limit", function() {
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:runAndDownload", "867");
                });

                it("dismisses the dialog", function() {
                    expect("close.facebox").toHaveBeenTriggeredOn($(document));
                });
            });
        });
    });
});
