describe("chorus.views.AlpineWorkfileContent", function() {
    beforeEach(function() {
        this.model = newFixtures.workfile.image();
        this.view = new chorus.views.AlpineWorkfileContent({ model: this.model })
    });

    it("starts fetch of the alpine flow image", function() {
        expect(this.view.alpineFlowImage).toHaveBeenFetched();
    })

    it("displays a loading spinner", function() {
        this.view.render();
        expect(this.view.$(".loading_section")).toExist();
    });

    describe("when the fetch completes successfully", function() {
        beforeEach(function() {
            this.server.lastFetchFor(this.view.alpineFlowImage).
                respond(200, { 'Content-Type': 'text/plain' }, "/foo.png");
        })

        it("renders an image with the appropriate src", function() {
            expect(this.view.$("img").attr("src")).toBe("/alpine/foo.png");
        });
    })

    describe("when the fetch fails to find a flow image", function() {
        beforeEach(function() {
            this.server.lastFetchFor(this.view.alpineFlowImage).
                respond(200, { 'Content-Type': 'text/plain' }, "");
        })

        it("renders an image with the appropriate src", function() {
            expect($(this.view.el)).toContainTranslation("alpine.no_preview");
        });
    })
});
