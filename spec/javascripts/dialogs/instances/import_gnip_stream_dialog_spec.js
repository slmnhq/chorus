describe("ImportGnipStream", function () {
    beforeEach(function () {
        this.gnip = rspecFixtures.gnipInstance();
        this.dialog = new chorus.dialogs.ImportGnipStream({model:this.gnip });
    });

    describe("render", function () {
        beforeEach(function () {
            this.dialog.render();
        });
        it("has the correct title", function () {
            expect(this.dialog.$("h1")).toContainTranslation("gnip.import_stream.title");
        });

        it("has 'import into a sandbox' fieldset legend", function() {
           expect(this.dialog.$("fieldset legend")).toContainTranslation("gnip.import_stream.import_into_sandbox")
           expect(this.dialog.$("fieldset legend a")).toContainTranslation("gnip.import_stream.select_workspace")
        });
    });
    
});