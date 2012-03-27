describe("chorus.views.AlpineWorkfileContentDetails", function() {
    beforeEach(function() {
        this.model = fixtures.alpineWorkfile();
        this.model.get("versionInfo").versionFilePath = "/tmp/run_file_test.afm";
        this.view = new chorus.views.AlpineWorkfileContentDetails({ model: this.model })
    });

    describe("render", function() {
        it("shows the 'Run File' button", function() {
            this.view.render();
            expect(this.view.$('a.button.run_file')).toContainTranslation('workfile.content_details.run_file')
        });

        it("links the 'Run File' button to the Alpine Illuminator page", function() {
            this.view.render();
            expect(this.view.$('a.button.run_file')).toHaveHref('/AlpineIlluminator/alpine/result/runflow.jsp?flowFilePath=/tmp/run_file_test.afm');
        });

        it("opens the Alpine Illuminator in a new tab", function() {
            this.view.render();
            expect(this.view.$('a.button.run_file').attr('target')).toBe('alpine_illuminator');
        });
    });
});
