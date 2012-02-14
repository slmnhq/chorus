describe("chorus.views.DatasetEditChorusView", function() {
    beforeEach(function() {

        this.dataset = fixtures.datasetChorusView();
        this.view = new chorus.views.DatasetEditChorusView({ model: this.dataset });
        $("#jasmine_content").append(this.view.el);
        this.clock = sinon.useFakeTimers();

        // in IE8, we can't 'select' a textrange whose textarea is not on the DOM
        if ($.browser.msie) {
            spyOn(window.TextRange.prototype, 'select');
        }
        spyOn(CodeMirror, "fromTextArea").andCallThrough();
    })

    context("without defer stubbed out", function() {
        it("defers call to CodeMirror", function() {
            this.view.render();
            expect(CodeMirror.fromTextArea).not.toHaveBeenCalled();
            this.clock.tick(1000);
            expect(CodeMirror.fromTextArea).toHaveBeenCalled();
        });
    });

    context("with defer stubbed out", function() {
        beforeEach(function() {
            stubDefer()
        });

        describe("#render", function() {
            beforeEach(function() {
                this.view.render();
            });

            context("when deferred CodeMirror creation happens twice in one dom render", function() {
                beforeEach(function() {
                    var deferredCodeMirror = _.defer.calls[0].args[0];
                    deferredCodeMirror();
                });

                it("only calls CodeMirror once", function() {
                    expect(CodeMirror.fromTextArea.callCount).toBe(1);
                });
            });

            describe("#editable", function() {
                it("set the file to be editable", function() {
                    this.view.model.canEdit = function() {
                        return true;
                    }
                    this.view.render();
                    expect(this.view.editor.getOption("readOnly")).toBe(false);
                });
                it("set the file to be not editable", function() {
                    this.view.model.canEdit = function() {
                        return false;
                    }
                    this.view.render();
                    expect(this.view.editor.getOption("readOnly")).toBeFalsy();
                });
            });

            it("displays line numbers", function() {
                expect(this.view.editor.getOption("lineNumbers")).toBe(true);
            });

            it("displays the text file content", function() {
                expect(this.view.editor.getValue()).toBe(this.dataset.get("query"));
            });

            it("uses the 'text/x-sql' mode for plain text files", function() {
                expect(this.view.editor.getOption("mode")).toBe("text/x-sql");
            });
        });


        describe("#saveChanges", function() {
            beforeEach(function() {
                this.view.$(".text_editor").text("select * from table_abc");
                this.view.render();

                spyOn(this.view.model, "save");
                this.view.editor.setCursor(0, 19);
                this.view.trigger("dataset:saveEdit");
                this.clock.tick(1000);
            });

            it("sets cursor at the correct position", function() {
                expect(this.view.editor.getCursor().ch).toBe(19);
                expect(this.view.editor.getCursor().line).toBe(0);
            });

            it("saves the model", function() {
                expect(this.view.model.save).toHaveBeenCalled();
            });

            it("sets the query in the model", function() {
                expect(this.view.model.get("query")).toBe("select * from table_abc");
            })
        });
    });
});
