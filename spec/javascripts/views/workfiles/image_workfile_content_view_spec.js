describe("chorus.views.ImageWorkfileContent", function() {
    beforeEach(function() {
        this.model = newFixtures.workfile.image();
        this.view = new chorus.views.ImageWorkfileContent({ model : this.model })
    });

    describe("render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("creates an image tag referencing the workfile", function() {
            var img = this.view.$("img")
            expect(img).toExist();
            expect(img).toHaveAttr("src", this.model.get("versionInfo").contentUrl);
        });
    });
});
