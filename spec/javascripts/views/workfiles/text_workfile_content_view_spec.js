    describe("chorus.views.TextWorkfileContentView", function() {
    beforeEach(function() {
        this.textfile = fixtures.textWorkfile({ content: "select * from foos where bar_id = 1;" });

        this.view = new chorus.views.TextWorkfileContent({model: this.textfile});
        this.saveInterval = this.view.saveInterval;
        $("#jasmine_content").append(this.view.el);

        // in IE8, we can't 'select' a textrange whose textarea is not on the DOM
        if ($.browser.msie) { spyOn(window.TextRange.prototype, 'select'); }
    })

    describe("#render", function() {
        beforeEach(function() {
            spyOn(CodeMirror, "fromTextArea").andCallThrough();
            this.view.render();
        });

        it("calls CodeMirror", function() {
            expect(CodeMirror.fromTextArea).toHaveBeenCalled();
        });

        describe("#editable", function() {
            it("set the file to be editable", function() {
                this.view.model.canEdit = function() { return true; }
                this.view.render();
                expect(this.view.editor.getOption("readOnly")).toBe(false);
            });
            it("set the file to be not editable", function() {
                this.view.model.canEdit = function() { return false; }
                this.view.render();
                expect(this.view.editor.getOption("readOnly")).toBe("nocursor");
            });
        });

        it("displays line numbers", function() {
            expect(this.view.editor.getOption("lineNumbers")).toBe(true);
        });

        it("displays the text file content", function() {
            expect(this.view.editor.getValue()).toBe(this.textfile.get("content"));
        });

        it("uses the 'text/plain' mode for plain text files", function() {
            expect(this.view.editor.getOption("mode")).toBe("text/plain");
        });

        context("when the model is an SQL file", function() {
            beforeEach(function() {
                this.textfile.set({ mimeType : "text/x-sql" });
                this.view.render();
            });

            it("uses the 'text/x-sql' mode", function() {
                expect(this.view.editor.getOption("mode")).toBe("text/x-sql");
            });
        });
    });

    describe("#editText", function() {
        beforeEach(function(){
            this.view.render();

            this.view.editor.setCursor(500, 500);
            spyOn(this.view.editor, "focus");
            this.view.editText();
        });

        afterEach(function(){
            this.view.replaceCurrentVersion();
        })

        it("sets readonly to false", function() {
            expect(this.view.editor.getOption("readOnly")).toBe(false);
        });

        it("focuses on the editable text", function() {
            expect(this.view.editor.focus).toHaveBeenCalled();
        });

        it("puts the cursor at the beginning of the first line", function() {
            var coords = this.view.editor.getCursor();
            expect(coords.line).toBe(0);
            expect(coords.ch).toBe(0);
        });

        it("adds the editable class to the CodeMirror div", function(){
            expect(this.view.$(".CodeMirror")).toHaveClass("editable");
        });
    });

    describe("#autosave", function() {
        beforeEach(function(){
            this.view.render();
            this.clock = sinon.useFakeTimers();
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
                        this.view.editor.setValue("Foo, Bar, Baz, Quux");
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

    describe("#saveChanges", function(){
        beforeEach(function(){
            this.view.render();

            spyOn(this.view.model, "save");

            this.view.editText();
            this.view.editor.setCursor(0, 19);
            this.view.replaceCurrentVersion();
        });

        it("should still be in edit mode", function(){
            waits(100);
            runs(function() {
                expect(this.view.$(".CodeMirror")).toHaveClass("editable");
            });
        });

        it("sets readonly to nocursor", function() {
            waits(100);
            runs(function() {
                expect(this.view.editor.getOption("readOnly")).toBe(false);
            });
        });

        it("sets cursor at the correct position", function() {
            waits(100);
            runs(function() {
                expect(this.view.editor.getCursor().ch).toBe(19);
                expect(this.view.editor.getCursor().line).toBe(0);
            });
        });

        it("saves the model", function(){
            expect(this.view.model.save).toHaveBeenCalled();
        });
    });

    describe("event file:saveCurrent", function(){
        beforeEach(function(){
            // this.view.editor becomes set in view.render
            this.view.render();

            // Because view.saveChanges is bound in view.setup, it is difficult/impossible to spy on the proper function...
            // so we'll spy on the side-effect of calling that function.
            spyOn(this.view.model, "save").andCallThrough();
            this.view.trigger("file:saveCurrent");
        });

        it("calls saveChanges", function(){
            expect(this.view.model.save).toHaveBeenCalled();
        });

        context("when there is a version conflict", function() {
            beforeEach(function() {
                stubModals();
                spyOn(chorus.Modal.prototype, 'launchModal').andCallThrough();
                message = {
                    "message" : "Bad version, bro",
                    "msgkey" : "WORKFILE.VERSION_TIMESTAMP_NOT_MATCH"
                }
                var model = this.view.model
                var url = "/edc/workspace/" + model.get("workspaceId") + "/workfile/" +
                    model.get("id") + "/version/" + model.get("versionNum");
                this.failSaveFor(this.view.model, message, {url: url});
            });

            it("should show the version conflict dialog", function() {
                expect(chorus.Modal.prototype.launchModal).toHaveBeenCalled();
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
                chorus.router.trigger("leaving");
            });

            it("saves a draft", function() {
                expect(this.server.creates().length).toBe(1);
            });
        });

        context("when the file has not been changed", function() {
            beforeEach(function() {
                chorus.router.trigger("leaving");
            });

            it("does not save the draft", function() {
                expect(this.server.creates().length).toBe(0);
            });
        });
    });

    describe("event file:createWorkfileNewVersion", function(){
        beforeEach(function() {
            this.view.model.set({"content": "old content"});
            this.view.model.set({"latestVersionNum": 2});

            this.view.render();

            this.view.editor.setValue("new content");

            spyOn(this.view, "stopTimer");
            spyOn(chorus.dialogs.WorkfileNewVersion.prototype, "launchModal");
            this.view.trigger("file:createWorkfileNewVersion");
        });

        it("calls stops the auto save timer", function() {
            expect(this.view.stopTimer).toHaveBeenCalled();
        });

        it("updates the model", function() {
            expect(this.view.model.get("content")).toBe("new content");
        });

        it("launches save workfile as new version dialog", function() {
            expect(chorus.dialogs.WorkfileNewVersion.prototype.launchModal).toHaveBeenCalled();
        });

        it("launches the new dialog with the correct model", function() {
            expect(this.view.dialog.model).toBeA(chorus.models.Workfile);

        });
    });
});
