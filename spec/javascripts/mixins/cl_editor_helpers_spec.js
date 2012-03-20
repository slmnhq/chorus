describe("chorus.mixins.clEditor", function() {
    beforeEach(function() {
        this.editorContainer = $("<div class='container'><div class='toolbar'></div><textarea name='summary'></textarea></div>");
        $('#jasmine_content').append(this.editorContainer);

        _.each(controls, function(control) {
            spyOn(chorus.Mixins.ClEditor,  "onClickToolbar"+ _.capitalize(control)).andCallThrough();
        });

        this.editor = chorus.Mixins.ClEditor.makeEditor(this.editorContainer, "toolbar", "summary");
    });

    it("should return a cl editor", function() {
        expect(this.editor).toBeDefined();
        expect(this.editor).toBeA(cleditor);
    });

    it("should have the given controls", function() {
        expect(this.editor.options.controls).toBe("bold italic | bullets numbering | link unlink");
    });

    var controls = ["bold", "italic", "bullets", "numbers", "link", "unlink"];
    _.each(controls, function(control) {
        it("should append the " + control + " control to the toolbars", function() {
            expect($('.toolbar a.'+ control)).toExist();
            expect($('.toolbar a.'+ control)).toContainTranslation("workspace.settings.toolbar." + control);
        })

        it("should bind clicking on the " + control + " link to onClickToolBar" + _.capitalize(control), function(){
            var methodName = "onClickToolbar"+ _.capitalize(control)
            $('.toolbar a.' + control).click();
            expect(chorus.Mixins.ClEditor[methodName]).toHaveBeenCalled();
        });
    });

    describe("#onClickToolbarBold", function() {
        it("should click the corresponding cleditorButton", function() {
            spyOnEvent(".cleditorButton[title='Bold']", "click");
            $('a.bold').click();
            expect("click").toHaveBeenTriggeredOn(".cleditorButton[title='Bold']");
        });
    });

    describe("#onClickToolbarItalic", function() {
        it("should click the corresponding cleditorButton", function() {
            spyOnEvent(".cleditorButton[title='Italic']", "click");
            $('a.italic').click();
            expect("click").toHaveBeenTriggeredOn(".cleditorButton[title='Italic']");
        });
    });
    describe("#onClickToolbarBullets", function() {
        it("should click the corresponding cleditorButton", function() {
            spyOnEvent(".cleditorButton[title='Bullets']", "click");
            $('a.bullets').click();
            expect("click").toHaveBeenTriggeredOn(".cleditorButton[title='Bullets']");
        });
    });

    describe("#onClickToolbarNumbers", function() {
        it("should click the corresponding cleditorButton", function() {
            spyOnEvent(".cleditorButton[title='Numbering']", "click");
            $('a.numbers').click();
            expect("click").toHaveBeenTriggeredOn(".cleditorButton[title='Numbering']")
        });
    });

    describe("#onClickToolbarLink", function() {
        it("should click the corresponding cleditorButton", function() {
            spyOnEvent(".cleditorButton[title='Insert Hyperlink']", "click");
            $('a.link').click();
            expect("click").toHaveBeenTriggeredOn(".cleditorButton[title='Insert Hyperlink']");
        });
    });

    describe("#onClickToolbarUnlink", function() {
        it("should click the corresponding cleditorButton", function() {
            spyOnEvent(".cleditorButton[title='Remove Hyperlink']", "click");
            $('a.unlink').click();
            expect("click").toHaveBeenTriggeredOn(".cleditorButton[title='Remove Hyperlink']");
        });
    });
});