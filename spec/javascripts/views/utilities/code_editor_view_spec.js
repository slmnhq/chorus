describe("chorus.views.CodeEditorView", function() {
    beforeEach(function() {
        this.dataset = fixtures.datasetChorusView();
        this.view = new chorus.views.CodeEditorView();
        $("#jasmine_content").append(this.view.el);
        this.clock = sinon.useFakeTimers();

        // in IE8, we can't 'select' a textrange whose textarea is not on the DOM
        if ($.browser.msie) {
            spyOn(window.TextRange.prototype, 'select');
        }
        spyOn(CodeMirror, "fromTextArea").andCallThrough();
    })

    context("#setup", function() {
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
                spyOn($.ui, "droppable");
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

            it("displays line numbers", function() {
                expect(this.view.editor.getOption("lineNumbers")).toBe(true);
            });

            context("and the user clicks insert on a function", function() {
                beforeEach(function() {
                    spyOn(this.view.editor, 'replaceSelection')
                    chorus.PageEvents.broadcast("file:insertText", "my awesome function");
                })
                it("inserts the function", function() {
                    expect(this.view.editor.replaceSelection).toHaveBeenCalledWith("my awesome function");
                })
            })

            it("prepares the editor for drag/drop events", function() {
                expect($($.ui.droppable.calls[0].args[1])[0]).toBe(this.view.$(".CodeMirror")[0]);
            });

            context("and the user drops a table name via drag and drop", function() {
                beforeEach(function() {
                    spyOn(this.view, "insertText");
                    var draggable = $('<div data-fullname="test"></div>');
                    var ui = {draggable: draggable};
                    this.view.acceptDrop({}, ui);
                });

                it("inserts the text", function() {
                    expect(this.view.insertText).toHaveBeenCalledWith("test");
                });
            });
        });
    });

});