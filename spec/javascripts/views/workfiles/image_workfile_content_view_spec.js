describe("ImageWorkfileContent", function() {
    beforeEach(function() {
        fixtures.model = "Workfile"
        this.loadTemplate("image_workfile_content")
        this.model = fixtures.modelFor("image")
        this.view = new chorus.views.ImageWorkfileContent({ model : this.model })
    });

    describe("render", function() {
        beforeEach(function() {
            this.view.render();
        })

        it("creates an image tag referencing the workfile", function() {
            var img = this.view.$("img")
            expect(img).toExist();
            expect(img).toHaveAttr("src", "/edc/workspace/10000/workfile/10035/file/1322591475139_3804")
        })
    })
});
