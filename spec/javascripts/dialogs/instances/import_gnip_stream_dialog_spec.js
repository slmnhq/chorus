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
    });
    
});