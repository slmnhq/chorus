    describe("chorus.views.TextWorkfileContentView", function() {
    beforeEach(function() {
        fixtures.model = "Workfile";
        this.textfile = fixtures.modelFor("fetchText");

        this.view = new chorus.views.TextWorkfileContent({model: this.textfile});

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

        it("set the file to be editable", function() {
            expect(this.view.editor.getOption("readOnly")).toBe(false);
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
            this.view.saveChanges();
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
        });

        it("stops the timer when 'Save As' is clicked", function() {
            this.view.editor.setValue("Foo, Bar, Baz")
            this.view.saveChanges();
            expect(this.view.saveTimer).toBe(undefined);
        });

        it("starts a timer when a change is detected", function() {
            spyOn(this.view, "startTimer");
            this.view.editor.setValue("Foo, Bar, Baz")
            expect(this.view.startTimer).toHaveBeenCalled();
        });

        context("with a timeout" ,function() {
            beforeEach(function(){
                spyOn(window, "setTimeout");
                spyOn(window, "clearTimeout");
            });

            it("saves the file once after a change is detected", function() {
                this.view.editor.setValue("Foo, Bar, Baz");
                expect(window.setTimeout).toHaveBeenCalled();

                this.view.saveDraft(this.view);
                expect(window.clearTimeout).toHaveBeenCalled();
            });

            it("saves the file once after two changes are detected", function() {
                this.view.editor.setValue("Foo");
                this.view.editor.setValue("Bar");
                expect(window.setTimeout).toHaveBeenCalled();
            });

            it("saves the file twice after two changes are detected", function() {
                this.view.editor.setValue("Foo");
                expect(window.setTimeout).toHaveBeenCalled();

                this.view.editor.setValue("Bar");
                expect(window.setTimeout).toHaveBeenCalled();
            });
        });
    });

    describe("#saveChanges", function(){
        beforeEach(function(){
            this.view.render();

            spyOn(this.view.model, "save");

            this.view.editText();
            this.view.editor.setCursor(0, 19);
            this.view.saveChanges();
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
            spyOn(this.view.model, "save");
            this.view.trigger("file:saveCurrent");
        });

        it("calls saveChanges", function(){
            expect(this.view.model.save).toHaveBeenCalled();
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
                expect(this.view.model.get("baseVersionNum")).toBe(2);
            });

            it("launches save workfile as new version dialog", function() {
                expect(chorus.dialogs.WorkfileNewVersion.prototype.launchModal).toHaveBeenCalled();
            });


            it("launches the new dialog with the correct model", function() {
                expect(this.view.dialog.model).toBeA(chorus.models.WorkfileNewVersion);

            });
        });
});
