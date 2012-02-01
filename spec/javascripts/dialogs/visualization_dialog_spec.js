describe("chorus.dialogs.Visualization", function() {
    beforeEach(function() {
        this.launchElement = $('<a data-name="Foo"/>')
        this.dialog = new chorus.dialogs.Visualization({launchElement : this.launchElement});
    });

    describe("#render", function() {

        it("should have a title", function() {
            expect(this.dialog.title).toMatchTranslation("visualization.title", {name: "Foo"});
        });
    })
});
