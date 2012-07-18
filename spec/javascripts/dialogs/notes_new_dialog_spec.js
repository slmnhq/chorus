describe("chorus.dialogs.NotesNewDialog", function() {
    beforeEach(function() {
        stubDelay();
        this.dialog = new chorus.dialogs.NotesNew({
            entityType: "instance",
            entityId: 1,
            pageModel: new chorus.models.GreenplumInstance()
        });
        $('#jasmine_content').append(this.dialog.el);
        this.dialog.render();
    });

    describe("#setup", function() {
        it("creates the correct model", function() {
            expect(this.dialog.model).toBeA(chorus.models.Note);
        });

        it("sets the correct properties on the model", function() {
            expect(this.dialog.model.get("entityType")).toBe("instance");
            expect(this.dialog.model.get("entityId")).toBe(1);
        });

        it("stores the correct pageModel", function() {
            expect(this.dialog.pageModel).not.toBeUndefined();
        });

    });

    describe("#render", function() {
        it("has the right title", function() {
            expect(this.dialog.$(".dialog_header h1")).toContainTranslation("notes.new_dialog.title");
        });

        it("has the right placeholder", function() {
            expect(this.dialog.$("textarea[name=body]").attr("placeholder")).toBe(t("notes.placeholder", {noteSubject: "instance"}));
        });

        it("has the right button text", function() {
            expect(this.dialog.$("button.submit").text().trim()).toMatchTranslation("notes.button.create");
        });

        context("when a displayEntityType is available", function() {
            beforeEach(function() {
                this.dialog = new chorus.dialogs.NotesNew({
                    entityType: "instance",
                    entityId: 1,
                    displayEntityType: 'foo',
                    pageModel: new chorus.models.GreenplumInstance()
                });
                $('#jasmine_content').append(this.dialog.el);
                this.dialog.render();
            });

            it("shows the displayEntityType in the placeholder", function() {
                expect(this.dialog.$("textarea[name=body]").attr("placeholder")).toBe(t("notes.placeholder", {noteSubject: "foo"}));
            });
        });
    });
});
