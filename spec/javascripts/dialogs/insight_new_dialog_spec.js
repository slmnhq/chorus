describe("chorus.dialogs.InsightsNewDialog", function() {
    beforeEach(function() {
        this.launchElement = $("<a data-allow-workspace-attachments='true' data-workspace-id='22'></a>")
        this.dialog = new chorus.dialogs.InsightsNew({
            launchElement : this.launchElement
        });

        this.dialog.render();
        $('#jasmine_content').append(this.dialog.el);
    });

    describe("#setup", function() {
        it("creates an Insight as the model", function() {
            expect(this.dialog.model).toBeA(chorus.models.Insight);
        });

        it("uses the correct workspace id", function() {
            expect(this.dialog.model.get("workspaceId")).toBe(22)
        });
    });

    describe("#render", function() {
        it("has the right title", function() {
            expect(this.dialog.$(".dialog_header h1")).toContainTranslation("insight.new_dialog.title");
        });

        it("has the right placeholder", function() {
            expect(this.dialog.$("textarea[name=body]").attr("placeholder")).toMatchTranslation("insight.placeholder");
        });

        it("has the right button text", function() {
            expect(this.dialog.$("button.submit").text().trim()).toMatchTranslation("insight.button.create");
        });
    });
});
