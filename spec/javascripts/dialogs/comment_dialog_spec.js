describe("CommentDialog", function() {
    beforeEach(function() {
        this.launchElement = $("<a data-entity-type='note' data-entity-id='1' data-entity-title='note'></a>")
        this.dialog = new chorus.dialogs.Comment({
            launchElement : this.launchElement,
            pageModel : new chorus.models.Workfile()
        });
    });

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
            expect($(this.dialog.el).attr("title")).toBe(t("comments.new_dialog.title"));
        });

        it("renders the body", function(){
            this.dialog.model.set({body : "cats"})
            this.dialog.render();
            expect(this.dialog.$("textarea[name=body]").val()).toBe("cats")
        });

        it("has the right placeholder", function() {
            expect(this.dialog.$("textarea[name=body]").attr("placeholder")).toBe(t("comments.placeholder", "note"));
        });

        it("calls elastic on the textarea after the view is attached to the dom", function() {
            spyOn($.fn, 'elastic');
            this.dialog.render();
            expect($.fn.elastic).not.toHaveBeenCalled();

            waitsFor(function() {
                return $.fn.elastic.callCount > 0;
            }, "elastic to be called", 500);

            runs(function() {
                expect($.fn.elastic.mostRecentCall.object).toBe("textarea");
            })
        })
    });
//
//    describe("submit", function() {
//        beforeEach(function() {
//            this.dialog.render();
//            spyOn(this.dialog.model, "save").andCallThrough();
//            spyOn(this.dialog, "closeModal");
//            this.dialog.$("textarea[name=body]").val("The body of a note");
//            this.dialog.$("form").trigger("submit");
//        });
//
//        it("saves the data", function(){
//            expect(this.dialog.model.get("body")).toBe("The body of a note")
//            expect(this.dialog.model.save).toHaveBeenCalled();
//        });
//
//        it("closes the dialog box if saved successfully", function() {
//            this.dialog.model.trigger("saved");
//            expect(this.dialog.closeModal).toHaveBeenCalled();
//        });
//
//        it("doesn't close the dialog box if it not saved successfully", function() {
//            this.dialog.model.trigger("savedFailed");
//            expect(this.dialog.closeModal).not.toHaveBeenCalled();
//        });
//
//        it("trims the note", function(){
//            this.dialog.$("textarea[name=body]").val("  trim me  ");
//            this.dialog.$("form").trigger("submit");
//            expect(this.dialog.model.get("body")).toBe("trim me")
//        });
//
//        it("triggers the 'invalidated' event on the model", function() {
//            var invalidatedSpy = jasmine.createSpy("invalidated");
//            this.dialog.pageModel.bind("invalidated", invalidatedSpy);
//            this.dialog.model.trigger("saved");
//            expect(invalidatedSpy).toHaveBeenCalled();
//        })
//    });
});
