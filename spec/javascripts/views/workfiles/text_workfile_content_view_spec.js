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

        it("set readonly to true", function() {
            expect(this.view.editor.getOption("readOnly")).toBe("nocursor");
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
            this.view.saveChanges();
        });

        it("removes the editable class from the CodeMirror div", function(){
            expect(this.view.$(".CodeMirror")).not.toHaveClass("editable");
        });

        it("sets readonly to nocursor", function() {
            expect(this.view.editor.getOption("readOnly")).toBe("nocursor");
        });

        it("saves the model", function(){
            expect(this.view.model.save).toHaveBeenCalled();
        });
    });

    describe("event file:edit", function(){
        beforeEach(function(){
            // this.view.editor becomes set in view.render
            this.view.render();

            // Because view.editText is bound in view.setup, it is difficult/impossible to spy on the proper function...
            // so we'll spy on the side-effect of calling that function.
            spyOn(this.view.editor, "focus");
            this.view.trigger("file:edit");
        });

        it("calls editText", function(){
            expect(this.view.editor.focus).toHaveBeenCalled();
        });
    });

    describe("event file:save", function(){
        beforeEach(function(){
            // this.view.editor becomes set in view.render
            this.view.render();

            // Because view.saveChanges is bound in view.setup, it is difficult/impossible to spy on the proper function...
            // so we'll spy on the side-effect of calling that function.
            spyOn(this.view.model, "save");
            this.view.trigger("file:save");
        });

        it("calls saveChanges", function(){
            expect(this.view.model.save).toHaveBeenCalled();
        });
    });
});
