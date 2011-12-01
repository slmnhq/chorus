describe("chorus.views.TextWorkfileContentView", function() {
    beforeEach(function() {
        fixtures.model = "Workfile";
        this.loadTemplate("text_workfile_content");
        this.textfile = fixtures.modelFor("fetchText");

        this.view = new chorus.views.TextWorkfileContent({model: this.textfile});
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
    });

    describe("#editText", function() {
        beforeEach(function(){
            this.view.render();

            this.view.editor.setCursor(500, 500);
            spyOn(this.view.editor, "focus");
            this.view.editText();
        });

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