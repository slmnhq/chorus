describe("chorus.dialogs.SqlPreview", function() {
    describe("#render", function() {
        beforeEach(function() {
            this.launchElement = $("<a></a>");
            this.dialog = new chorus.dialogs.SqlPreview({
                launchElement: this.launchElement,
                model : fixtures.datasetSandboxTable()
            });
            spyOn(_, 'defer');
            spyOn(CodeMirror, 'fromTextArea').andReturn({ refresh: $.noop });
            this.dialog.render();
            this.parent = {
                sql : function(){ return "select awesome from sql"; }
            }
        });

        it("has a close window button", function() {
            expect(this.dialog.$('.modal_controls button.cancel')).toExist();
            expect(this.dialog.$('.modal_controls button.cancel').text().trim()).toMatchTranslation("actions.close_window");
        });

        it("hides the sql text area until the codemirror editor is ready", function() {
            var textarea = this.dialog.$("textarea");
            expect(textarea).toHaveClass("hidden");
            var deferredFn = _.defer.mostRecentCall.args[0];
            deferredFn();
            expect(CodeMirror.fromTextArea).toHaveBeenCalled();
            expect(CodeMirror.fromTextArea.mostRecentCall.args[0]).toBe(textarea[0]);
        });

        describe("preview bar", function() {
            it("has a link to 'Data Preview'", function() {
                expect(this.dialog.$("button.preview")).toExist();
            });

            describe("opening the Data Preview", function() {
                beforeEach(function() {
                    this.launchElement.data("parent", this.parent);
                    spyOn(this.dialog.resultsConsole, "execute").andCallThrough();
                    this.dialog.$("button.preview").click();
                });

                it("shows a results console", function() {
                    expect(this.dialog.resultsConsole.execute).toHaveBeenCalledWith(this.dialog.model.preview());
                });

                describe("closing the Data Preview", function() {
                    beforeEach(function() {
                        this.dialog.$(".results_console .close").click()
                    });

                    it("does not show the Data Preview any longer", function() {
                        expect(this.dialog.$(".result_table")).toHaveClass("hidden")
                    });
                });
            });
        });

        describe("generated sql", function() {
            beforeEach(function() {
                this.launchElement.data("parent", this.parent);
            });

            it("constructs the SQL correctly", function() {
                expect(this.dialog.additionalContext().sql).toBe("select awesome from sql");
            });
        });
    });
});
