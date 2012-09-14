describe("chorus.dialogs.CommentDialog", function () {
    beforeEach(function () {
        this.dialog = new chorus.dialogs.Comment({
            entityType:"note",
            eventId:1,
            entityTitle:'note',
            pageModel:new chorus.models.Workfile()
        });
        stubDefer();
        spyOn(this.dialog, 'makeEditor');
    });

    it("does not re-render when the model changes", function () {
        expect(this.dialog.persistent).toBeTruthy();
    });

    describe("#setup", function () {
        it("configures the entity", function () {
            expect(this.dialog.model.get("entityType")).toBe("note");
            expect(this.dialog.model.get("eventId")).toBe(1);
        });
    });

    describe("#render", function () {
        beforeEach(function () {
            this.dialog.render();
        });

        it("has the right title", function () {
            expect(this.dialog.$(".dialog_header h1")).toContainTranslation("comments.new_dialog.title");
        });

        it("renders the body", function () {
            this.dialog.model.set({text:"cats"});
            this.dialog.render();
            expect(this.dialog.$("textarea[name=text]").val()).toBe("cats");
        });

        it("has the right placeholder", function () {
            expect(this.dialog.$("textarea[name=text]").attr("placeholder")).toBe(t("comments.placeholder", {commentSubject:"note"}));
        });

        it("makes a cl editor with toolbar", function () {
            expect(this.dialog.makeEditor).toHaveBeenCalledWith($(this.dialog.el), ".toolbar", "text", { width:566, height:150 });
            expect(this.dialog.$('.toolbar')).toExist();
        });
    });

    describe("submit", function () {
        beforeEach(function () {
            this.dialog.render();
            spyOn(this.dialog.model, "save").andCallThrough();
            spyOn(this.dialog, "closeModal");
            this.dialog.$("textarea[name=text]").val("The body of a note");
            this.dialog.$("form").trigger("submit");
        });

        it("saves the data", function () {
            expect(this.dialog.model.get("text")).toBe("The body of a note");
            expect(this.dialog.model.save).toHaveBeenCalled();
        });

        it("closes the dialog box if saved successfully", function () {
            this.dialog.model.trigger("saved");
            expect(this.dialog.closeModal).toHaveBeenCalled();
        });

        it("doesn't close the dialog box if it not saved successfully", function () {
            this.dialog.model.trigger("savedFailed");
            expect(this.dialog.closeModal).not.toHaveBeenCalled();
        });

        it("trims the comment", function () {
            this.dialog.$("textarea[name=text]").val("trim me<div><br></div>");
            this.dialog.$("form").trigger("submit");
            expect(this.dialog.model.get("text")).toBe("trim me");
        });

        it("triggers the 'invalidated' event on the model", function () {
            spyOnEvent(this.dialog.pageModel, 'invalidated');
            this.dialog.model.trigger("saved");
            expect("invalidated").toHaveBeenTriggeredOn(this.dialog.pageModel);
        });

        it("broadcasts comment:added", function () {
            var addedSpy = jasmine.createSpy("comment:added");
            chorus.PageEvents.subscribe("comment:added", addedSpy);
            this.dialog.model.trigger("saved");
            expect(addedSpy).toHaveBeenCalled();
        });
    });

    describe("when an empty note is submitted", function() {
        beforeEach(function () {
            this.dialog.render();
            spyOn(this.dialog.model, "save").andCallThrough();
            spyOn(this.dialog, "markInputAsInvalid");
            this.dialog.$("textarea[name=text]").val("");
            this.dialog.$("form").trigger("submit");
        });

        it("marks the text input as invalid", function() {
            expect(this.dialog.markInputAsInvalid).toHaveBeenCalled();
        });
    });
});
