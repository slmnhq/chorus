describe("chorus.views.TextWorkfileContentView", function() {
    beforeEach(function() {
        chorus._navigated();
        this.textfile = fixtures.textWorkfile();
        spyOn(this.textfile.workspace(), 'isActive').andReturn(true);
        this.textfile.content("select * from foos where bar_id = 1;")
        this.view = new chorus.views.TextWorkfileContent({model: this.textfile});
        this.saveInterval = this.view.saveInterval;
        $("#jasmine_content").append(this.view.el);
        this.clock = this.useFakeTimers();

        // in IE8, we can't 'select' a textrange whose textarea is not on the DOM
        if ($.browser.msie) {
            spyOn(window.TextRange.prototype, 'select');
        }
        spyOn(CodeMirror, "fromTextArea").andCallThrough();
    })

    describe("hotkey options", function() {
        beforeEach(function() {
            spyOn(chorus.views.CodeEditorView.prototype, "postRender");
            this.view = new chorus.views.TextWorkfileContent({model: this.textfile, hotkeys: {a: "whatever", b: "something_else"}});
            this.view.render();
        });

        it("correctly sets the extraKeys on the CodeMirror options", function() {
            var opts = chorus.views.CodeEditorView.prototype.postRender.calls[0].args[0];
            expect(opts.extraKeys[_.str.capitalize(chorus.hotKeyMeta) + "-A"]).toBeDefined();
            expect(opts.extraKeys[_.str.capitalize(chorus.hotKeyMeta) + "-B"]).toBeDefined();
        });
    });

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
                    this.view.render();
                });

                it("uses the 'text/x-sql' mode", function() {
                    expect(this.view.editor.getOption("mode")).toBe("text/x-sql");
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
            });
        });

        describe("#render when read-only", function() {
            beforeEach(function() {
                this.textfile.set({canEdit: false});
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

        describe("#saveChanges", function() {
            beforeEach(function() {
                this.view.render();

                spyOn(this.view.model, "save");

                this.view.editText();
                this.view.editor.setCursor(0, 19);
                this.view.replaceCurrentVersion();
                this.clock.tick(1000);
            });

            it("should still be in edit mode", function(){
                expect(this.view.$(".CodeMirror")).toHaveClass("editable");
            });

            it("sets readonly to nocursor", function() {
                expect(this.view.editor.getOption("readOnly")).toBe(false);
            });

            it("sets cursor at the correct position", function() {
                expect(this.view.editor.getCursor().ch).toBe(19);
                expect(this.view.editor.getCursor().line).toBe(0);
            });

            it("saves the model", function() {
                expect(this.view.model.save).toHaveBeenCalled();
            });
        });

        describe("event file:saveCurrent", function() {
            beforeEach(function() {
                // this.view.editor becomes set in view.render
                this.view.render();

                // Because view.saveChanges is bound in view.setup, it is difficult/impossible to spy on the proper function...
                // so we'll spy on the side-effect of calling that function.
                spyOn(this.view.model, "save").andCallThrough();
                chorus.PageEvents.broadcast("file:saveCurrent");
            });

            it("calls saveChanges", function() {
                expect(this.view.model.save).toHaveBeenCalled();
            });

            context("when there is a version conflict", function() {
                beforeEach(function() {
                    this.modalSpy = stubModals();
                    var model = this.view.model
                    var url = "/workfiles/" + model.get("id") + "/versions/" + model.get("versionInfo").versionNum;
                    _.find(this.server.updates(), function(request){
                        return request.url === url ;
                    }).failUnprocessableEntity({fields: { version: {INVALID: {}}}});
                });

                it("should show the version conflict alert", function() {
                    expect(this.modalSpy).toHaveModal(chorus.alerts.WorkfileConflict);
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

        describe("event file:createWorkfileNewVersion", function() {
            beforeEach(function() {
                this.view.model.get("versionInfo").content = "old content";
                this.view.model.set({"latestVersionNum": 2});

                this.view.render();

                this.view.editor.setValue("new content");

                spyOn(this.view, "stopTimer");
                this.modalSpy = stubModals();
                chorus.PageEvents.broadcast("file:createWorkfileNewVersion");
            });

            it("calls stops the auto save timer", function() {
                expect(this.view.stopTimer).toHaveBeenCalled();
            });

            it("updates the model", function() {
                expect(this.view.model.content()).toBe("new content");
            });

            it("launches save workfile as new version dialog", function() {
                expect(this.modalSpy).toHaveModal(chorus.dialogs.WorkfileNewVersion);
            });

            it("launches the new dialog with the correct model", function() {
                expect(this.view.dialog.model).toBeA(chorus.models.Workfile);
            });
        });
    });
});
