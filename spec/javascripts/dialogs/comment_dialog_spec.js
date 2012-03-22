describe("chorus.dialogs.CommentDialog", function() {
    beforeEach(function() {
        this.launchElement = $("<a data-entity-type='note' data-entity-id='1' data-entity-title='note'></a>")
        this.dialog = new chorus.dialogs.Comment({
            launchElement : this.launchElement,
            pageModel : new chorus.models.Workfile()
        });
    });

    it("does not re-render when the model changes", function() {
        expect(this.dialog.persistent).toBeTruthy()
    })

    describe("#setup", function() {
        it("configures the entity", function() {
            expect(this.dialog.model.get("entityType")).toBe("note")
            expect(this.dialog.model.get("entityId")).toBe(1)
            expect(this.dialog.entityTitle).toBe("note")
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
        });

        it("has the right title", function() {
            expect(this.dialog.$(".dialog_header h1")).toContainTranslation("comments.new_dialog.title");
        });

        it("renders the body", function(){
            this.dialog.model.set({body : "cats"})
            this.dialog.render();
            expect(this.dialog.$("textarea[name=body]").val()).toBe("cats")
        });

        it("has the right placeholder", function() {
            expect(this.dialog.$("textarea[name=body]").attr("placeholder")).toBe(t("comments.placeholder", {commentSubject: "note"}));
        });
    });

    describe("submit", function() {
        beforeEach(function() {
            this.dialog.render();
            spyOn(this.dialog.model, "save").andCallThrough();
            spyOn(this.dialog, "closeModal");
            this.dialog.$("textarea[name=body]").val("The body of a note");
            this.dialog.$("form").trigger("submit");
        });

        it("saves the data", function(){
            expect(this.dialog.model.get("body")).toBe("The body of a note")
            expect(this.dialog.model.save).toHaveBeenCalled();
        });

        it("closes the dialog box if saved successfully", function() {
            this.dialog.model.trigger("saved");
            expect(this.dialog.closeModal).toHaveBeenCalled();
        });

        it("doesn't close the dialog box if it not saved successfully", function() {
            this.dialog.model.trigger("savedFailed");
            expect(this.dialog.closeModal).not.toHaveBeenCalled();
        });

        it("trims the comment", function(){
            this.dialog.$("textarea[name=body]").val("  trim me  ");
            this.dialog.$("form").trigger("submit");
            expect(this.dialog.model.get("body")).toBe("trim me")
        });

        it("triggers the 'invalidated' event on the model", function() {
            spyOnEvent(this.dialog.pageModel, 'invalidated');
            this.dialog.model.trigger("saved");
            expect("invalidated").toHaveBeenTriggeredOn(this.dialog.pageModel);
        })
    });
});
