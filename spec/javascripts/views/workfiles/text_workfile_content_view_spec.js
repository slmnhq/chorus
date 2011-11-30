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

            this.view.editText();
        });

        it("sets readonly to false", function() {
            expect(this.view.editor.getOption("readOnly")).toBe(false);
        });
    });
});