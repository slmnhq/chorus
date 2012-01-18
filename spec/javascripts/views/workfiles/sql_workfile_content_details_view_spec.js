describe("SqlWorkfileContentDetails", function() {
    beforeEach(function() {
        this.model = fixtures.workfile({fileName: 'test.sql'});
        this.view = new chorus.views.SqlWorkfileContentDetails({ model : this.model })
    });

    describe("render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("shows the 'Run File' button", function() {
            expect(this.view.$('button.run_file')).toContainTranslation('workfile.content_details.run_file')
        });
    });
});
