describe("chorus.views.CodeEditorView", function() {
    beforeEach(function() {
        this.dataset = newFixtures.dataset.chorusView();
        this.view = new chorus.views.CodeEditorView();
        $("#jasmine_content").append(this.view.el);
        this.clock = this.useFakeTimers();

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

    describe("#render", function() {
        beforeEach(function() {
            stubDefer()
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

        it("prepares the editor for drag/drop events", function() {
            expect($($.ui.droppable.calls[0].args[1])[0]).toBe(this.view.$(".CodeMirror")[0]);
        });

        context("and the user clicks insert on a function", function() {
            beforeEach(function() {
                spyOn(this.view.editor, 'replaceSelection');
                chorus.PageEvents.broadcast("file:insertText", "my awesome function");
            });

            it("inserts the function", function() {
                expect(this.view.editor.replaceSelection).toHaveBeenCalledWith("my awesome function");
            });
        });

        describe("drag and drop", function() {
            beforeEach(function() {
                this.drag = {draggable: $('<div data-fullname="test"></div>')};
                this.view.editor.replaceSelection("this is the first line\n\nthis is the third line");
                expect(this.view.editor.lineCount()).toBe(3);
            });

            it("inserts text at the beginning of a line", function() {
                var pos = this.view.editor.charCoords({line: 1, ch: 0});
                this.view.acceptDrop({pageX: pos.x, pageY: pos.y}, this.drag);
                expect(this.view.editor.getLine(1)).toBe("test");
            });

            it("inserts text in the middle of a line", function() {
                var pos = this.view.editor.charCoords({line:2, ch: 12});
                this.view.acceptDrop({pageX: pos.x, pageY: pos.y}, this.drag);
                expect(this.view.editor.getLine(2)).toBe("this is the testthird line");
            });
        });

        describe("#selection", function() {
            beforeEach(function() {
                spyOn(chorus.PageEvents, "broadcast").andCallThrough();
            });

            context("it has selected text", function() {
                beforeEach(function() {
                    spyOn(this.view.editor, "getSelection").andReturn(true);
                    this.view.$(".text_editor").mouseup();
                });

                it("broadcasts a file:selection event", function() {
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:selection");
                });
            });

            context("it has not selected any text" , function() {
                beforeEach(function() {
                    spyOn(this.view.editor, "getSelection").andReturn(false);
                    this.view.$(".text_editor").mousedown();
                });

                it("broadcasts a file:unselection event", function() {
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:unselection");
                });
            });

            context("the user selects text with the keyboard", function() {
                beforeEach(function() {
                    spyOn(this.view.editor, "getSelection").andReturn(true);
                    this.view.$(".text_editor").keydown();
                });

                it("broadcasts a file:selection event", function() {
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:selection");
                });
            });
        });

    });
});
