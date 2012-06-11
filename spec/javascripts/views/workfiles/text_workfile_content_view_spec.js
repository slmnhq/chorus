describe("chorus.views.TextWorkfileContentView", function() {
    beforeEach(function() {
        chorus._navigated();
        this.textfile = fixtures.textWorkfile();
        spyOn(this.textfile.workspace(), 'isActive').andReturn(true);
        this.textfile.content("select * from foos where bar_id = 1;");
        this.view = new chorus.views.TextWorkfileContent({model: this.textfile});
        this.saveInterval = this.view.saveInterval;
        $("#jasmine_content").append(this.view.el);
        this.clock = this.useFakeTimers();

        // in IE8, we can't 'select' a textrange whose textarea is not on the DOM
        if ($.browser.msie) {
            spyOn(window.TextRange.prototype, 'select');
        }
        spyOn(CodeMirror, "fromTextArea").andCallThrough();

        stubDefer();
    })

    describe("hotkey options", function() {
        beforeEach(function() {
            this.view = new chorus.views.TextWorkfileContent({model: this.textfile, hotkeys: {a: "whatever", b: "something_else"}});
            this.view.render();
        });

        it("correctly sets the extraKeys on the CodeMirror options", function() {
            var opts = CodeMirror.fromTextArea.mostRecentCall.args[1];
            expect(opts.extraKeys[_.str.capitalize(chorus.hotKeyMeta) + "-A"]).toBeDefined();
            expect(opts.extraKeys[_.str.capitalize(chorus.hotKeyMeta) + "-B"]).toBeDefined();
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        describe("#editable", function() {
            it("set the file to be editable", function() {
                spyOn(this.textfile, "canEdit").andReturn(true);
                this.view = new chorus.views.TextWorkfileContent({model: this.textfile});
                this.view.render();
                expect(this.view.editor.getOption("readOnly")).toBe(false);
            });

            it("set the file to be not editable", function() {
                spyOn(this.textfile, "canEdit").andReturn(false);
                this.view = new chorus.views.TextWorkfileContent({model: this.textfile});
                this.view.render();
                expect(this.view.editor.getOption("readOnly")).toBe("nocursor");
            });
        });

        it("displays line numbers", function() {
            expect(this.view.editor.getOption("lineNumbers")).toBe(true);
        });

        it("displays the text file content", function() {
            expect(this.view.editor.getValue()).toBe(this.textfile.content());
        });

        it("uses the 'text/plain' mode for plain text files", function() {
            expect(this.view.editor.getOption("mode")).toBe("text/plain");
        });

        xit("triggers a Ctrl+R keydown on the document when Ctrl+R keydown is received by the editor", function() {
            // Can't find a way to trigger keydown events to CodeMirror
            // Can't even figure out how to properly trigger a normal key in CodeMirror in the browser - maybe start there?
            spyOn(chorus, "triggerHotKey");
            $(this.view.$(".CodeMirror")[0].firstChild.firstChild).trigger(chorus.hotKeyEvent('r'));
            expect(chorus.triggerHotKey).toHaveBeenCalledWith('r');
        })

        context("when the model is an SQL file", function() {
            beforeEach(function() {
                this.textfile.set({ mimeType : "text/x-sql" });
                this.view = new chorus.views.TextWorkfileContent({model: this.textfile});
                this.view.render();
            });

            it("uses the 'text/x-sql' mode", function() {
                expect(this.view.editor.getOption("mode")).toBe("text/x-sql");
            });
        });
    });

    describe("#render when read-only", function() {
        beforeEach(function() {
            this.textfile.set({canEdit: false});
            this.view = new chorus.views.TextWorkfileContent({model: this.textfile});
            this.view.render();
        });

        it("has no save button", function() {
            expect(this.view.$("button")).not.toExist();
        });

        it("has read-only content area", function() {
            expect(this.view.editor.getOption("readOnly")).toBe("nocursor");
        });
    });

    describe("#editText", function() {
        beforeEach(function() {
            this.view.render();

            this.view.editor.setCursor(500, 500);
            spyOn(this.view.editor, "focus");
            this.view.editText();
        });

        afterEach(function() {
            this.view.replaceCurrentVersion();
        })

        it("sets readonly to false", function() {
            expect(this.view.editor.getOption("readOnly")).toBe(false);
        });

        it("focuses on the editable text", function() {
            expect(this.view.editor.focus).toHaveBeenCalled();
        });

        it("puts the cursor at the end of the file", function() {
            var coords = this.view.editor.getCursor();
            expect(coords.line).toBe(0);
            expect(coords.ch).toBe(36);
        });

        it("adds the editable class to the CodeMirror div", function() {
            expect(this.view.$(".CodeMirror")).toHaveClass("editable");
        });
    });

    describe("#autosave", function() {
        beforeEach(function() {
            this.view.render();
        });

        describe("when the file is changed", function() {
            beforeEach(function() {
                this.view.editor.setValue("Foo, Bar");
            });

            describe("when the file is changed again", function() {
                beforeEach(function() {
                    this.clock.tick(10);
                    this.view.editor.setValue("Foo, Bar, Baz");
                });

                describe("when the timeout elapses", function() {
                    beforeEach(function() {
                        this.clock.tick(this.saveInterval);
                    });

                    it("only saves the file once", function() {
                        expect(this.server.creates().length).toBe(1);
                        expect(this.server.updates().length).toBe(0);
                    });
                });
            });

            describe("when the timeout elapses", function() {
                beforeEach(function() {
                    this.clock.tick(this.saveInterval);
                });

                it("creates a draft", function() {
                    expect(this.server.creates().length).toBe(1);
                    expect(this.server.updates().length).toBe(0);
                });

                describe("when the timeout elapses again, with no changes", function() {
                    beforeEach(function() {
                        this.clock.tick(this.saveInterval);
                    });

                    it("does not save the draft again", function() {
                        expect(this.server.creates().length).toBe(1);
                        expect(this.server.updates().length).toBe(0);
                    });
                });

                describe("when the timeout elapses again after the file is changed again", function() {
                    beforeEach(function() {
                        this.server.lastCreate().succeed([]);
                        // start timer directly to imply change on code mirror
                        this.view.startTimer();
                        this.clock.tick(this.saveInterval);
                    });

                    it("updates the draft", function() {
                        expect(this.server.creates().length).toBe(1);
                        expect(this.server.updates().length).toBe(1);
                    });
                });
            });
        });
    });

    describe("saving the workfile", function() {
        beforeEach(function() {
            this.textfile.content("old content");
            this.textfile.set({"latestVersionNum": 2});

            this.view.render();
            this.view.editText();
            this.view.editor.setValue('This should be a big enough text, okay?')
            this.view.editor.setCursor(0, 19);

            this.modalSpy = stubModals();

            spyOn(this.view, "stopTimer");
            spyOn(this.textfile, "save").andCallThrough();
            spyOn(this.textfile, "canEdit").andReturn(true);
        });

        describe("the 'file:replaceCurrentVersion' event", function() {
            beforeEach(function() {
                chorus.PageEvents.broadcast("file:replaceCurrentVersion");
                this.clock.tick(10000);
            });

            it("calls save", function() {
                expect(this.view.model.save).toHaveBeenCalled();
            });

            it("sets cursor at the correct position", function() {
                expect(this.view.editor.getCursor().ch).toBe(19);
                expect(this.view.editor.getCursor().line).toBe(0);
            });

            it("sets readonly to nocursor", function() {
                expect(this.view.editor.getOption("readOnly")).toBe(false);
            });

            it("saves the selected content only", function() {
                expect(this.view.model.content()).toBe('This should be a big enough text, okay?');
            });

            it("maintains the editor in edit mode", function(){
                expect(this.view.$(".CodeMirror")).toHaveClass("editable");
            });

            context("when there is a version conflict", function() {
                it("shows the version conflict alert", function() {
                    this.server.lastUpdate().fail([{
                        "message" : "Bad version, bro",
                        "msgkey" : "WORKFILE.VERSION_TIMESTAMP_NOT_MATCH"
                    }]);

                    expect(this.modalSpy).toHaveModal(chorus.alerts.WorkfileConflict);
                });
            });
        });

        describe("event file:createNewVersion", function() {
            beforeEach(function() {
                chorus.PageEvents.broadcast("file:createNewVersion");
            });

            it("calls stops the auto save timer", function() {
                expect(this.view.stopTimer).toHaveBeenCalled();
            });

            it("updates the model", function() {
                expect(this.view.model.content()).toBe("This should be a big enough text, okay?");
            });

            it("launches the 'save workfile as new version' dialog with the correct model", function() {
                expect(this.modalSpy).toHaveModal(chorus.dialogs.WorkfileNewVersion);
                expect(this.view.dialog.model).toBeA(chorus.models.Workfile);
            });
        });

        context("with text selected", function() {
            beforeEach(function() {
                this.view.editor.setSelection({line: 0, ch:17}, {line: 0, ch: 20});
            });

            describe("the 'file:replaceCurrentVersionWithSelection' event", function() {
                beforeEach(function() {
                    chorus.PageEvents.broadcast("file:replaceCurrentVersionWithSelection");
                    this.clock.tick(10000);
                });

                it("calls save", function() {
                    expect(this.view.model.save).toHaveBeenCalled();
                });

                it("saves the selected content only", function() {
                    expect(this.view.model.content()).toBe('big');
                });

                it("puts the cursor at the end of the file", function() {
                    expect(this.view.editor.getCursor().ch).toBe("big".length);
                });

                it("sets readonly to nocursor", function() {
                    expect(this.view.editor.getOption("readOnly")).toBe(false);
                });

                it("maintains the editor in edit mode", function(){
                    expect(this.view.$(".CodeMirror")).toHaveClass("editable");
                });

                context("when there is a version conflict", function() {
                    it("shows the version conflict alert", function() {
                        this.server.lastUpdate().fail([{
                            "message" : "Bad version, bro",
                            "msgkey" : "WORKFILE.VERSION_TIMESTAMP_NOT_MATCH"
                        }]);

                        expect(this.modalSpy).toHaveModal(chorus.alerts.WorkfileConflict);
                    });
                });
            });

            describe("event file:createNewVersionFromSelection", function() {
                beforeEach(function() {
                    chorus.PageEvents.broadcast("file:createNewVersionFromSelection");
                });

                it("calls stops the auto save timer", function() {
                    expect(this.view.stopTimer).toHaveBeenCalled();
                });

                it("updates the model", function() {
                    expect(this.view.model.content()).toBe("big");
                });

                it("launches save workfile as new version dialog", function() {
                    expect(this.modalSpy).toHaveModal(chorus.dialogs.WorkfileNewVersion);
                });

                it("launches the new dialog with the correct model", function() {
                    expect(this.view.dialog.model).toBeA(chorus.models.Workfile);
                });
            });

            describe("event file:editorSelectionStatus", function() {
                beforeEach(function() {
                    spyOn(chorus.PageEvents, "broadcast").andCallThrough();
                });

                it("calls file:selectionPresent when there is some text selected", function() {
                    this.view.editor.setSelection({line: 0, ch:17}, {line: 0, ch: 20});

                    chorus.PageEvents.broadcast("file:editorSelectionStatus");

                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:selectionPresent");
                });

                it("calls file:selectionEmpty when there is No text selected", function() {
                    this.view.editor.setSelection({line: 0, ch:17}, {line: 0, ch: 17});

                    chorus.PageEvents.broadcast("file:editorSelectionStatus");

                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:selectionEmpty");
                });
            });
        });
    });


    describe("when navigating away", function() {
        beforeEach(function() {
            this.view.render();
        });

        context("when the file has been changed", function() {
            beforeEach(function() {
                this.view.editor.setValue("Foo, Bar, Baz, Quux");
                chorus._navigated();
            });

            it("saves a draft", function() {
                expect(this.server.creates().length).toBe(1);
            });
        });

        context("when the file has not been changed", function() {
            beforeEach(function() {
                chorus._navigated();
            });

            it("does not save the draft", function() {
                expect(this.server.creates().length).toBe(0);
            });
        });
    });


    describe("when the user changes the selection", function() {
        beforeEach(function() {
            spyOn(chorus.PageEvents, "broadcast");
            this.view.render();
            this.view.editor.setValue("content\n\nmore content");
        });

        context("the selection range is empty", function() {
            it("fires the selection empty event", function() {
                this.view.editor.setSelection({line: 1, ch: 0}, {line: 1, ch: 0});
                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith('file:selectionEmpty');
            });
        });

        context("the selection range is not empty", function() {
            it("fires the selection present event", function() {
                this.view.editor.setSelection({line: 0, ch: 0}, {line: 2, ch: 0});
                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith('file:selectionPresent');
            });
        });
    });
});
