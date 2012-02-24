describe("chorus.dialogs.NotesNewDialog", function() {
    beforeEach(function() {
        this.launchElement = $("<a data-entity-type='workfile' data-allow-workspace-attachments='true' data-entity-id='1' data-workspace-id='22'></a>");
        this.dialog = new chorus.dialogs.NotesNew({
            launchElement: this.launchElement,
            pageModel: new chorus.models.Workfile()
        });
        this.dialog.render();
        $('#jasmine_content').append(this.dialog.el);
    });

    describe("#setup", function() {
        it("creates the correct model", function() {
            expect(this.dialog.model).toBeA(chorus.models.Comment);
        });

        it("sets the correct properties on the model", function() {
            expect(this.dialog.model.get("entityType")).toBe("workfile");
            expect(this.dialog.model.get("entityId")).toBe(1)
        });
    });

    describe("#render", function() {
        it("has the right title", function() {
            expect(this.dialog.$(".dialog_header h1")).toContainTranslation("notes.new_dialog.title");
        });

        it("has the right placeholder", function() {
            expect(this.dialog.$("textarea[name=body]").attr("placeholder")).toBe(t("notes.placeholder", {noteSubject: "workfile"}));
        });

        it("has the right button text", function() {
            expect(this.dialog.$("button.submit").text().trim()).toMatchTranslation("notes.button.create");
        });

        context("when a displayEntityType is available", function() {
            beforeEach(function() {
                this.launchElement.data("display-entity-type", "foo");
                this.dialog = new chorus.dialogs.NotesNew({
                    launchElement: this.launchElement,
                    pageModel: new chorus.models.Workfile()
                });
                this.dialog.render();
            });

            it("shows the displayEntityType in the placeholder", function() {
                expect(this.dialog.$("textarea[name=body]").attr("placeholder")).toBe(t("notes.placeholder", {noteSubject: "foo"}));
            });
        });
    });
});
