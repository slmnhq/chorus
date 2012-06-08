describe("chorus.views.AlpineWorkfileContentDetails", function() {
    beforeEach(function() {
        this.model = rspecFixtures.workfile.binary({ fileType: "AFM" });
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
            url = URI('/AlpineIlluminator/alpine/result/runflow.jsp?')
                  .addQuery("flowFilePath", "/tmp/run_file_test.afm");
            url.addQuery('actions[create_workfile_insight]',
                          'http://' + window.location.host + '/comment/workfile/' + this.model.id + '?is_insight=true');
            expect(this.view.$('a.button.run_file')).toHaveHref(url);
        });

        it("opens the Alpine Illuminator in a new tab", function() {
            this.view.render();
            expect(this.view.$('a.button.run_file').attr('target')).toBe('alpine_illuminator');
        });
    });
});
