describe("chorus.views.ImageWorkfileContent", function() {
    beforeEach(function() {
        this.model = fixtures.imageWorkfile();
        this.view = new chorus.views.ImageWorkfileContent({ model : this.model })
    });

    describe("render", function() {
        beforeEach(function() {
            this.view.render();
        })

        it("creates an image tag referencing the workfile", function() {
            var img = this.view.$("img")
            expect(img).toExist();
            expect(img).toHaveAttr("src", "/edc/workspace/" + this.model.get("workspaceId") + "/workfile/" + this.model.get("id") + "/file/" + this.model.get("versionInfo").versionFileId)
        })
    })
});
