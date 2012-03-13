describe("chorus.views.AlpineWorkfileContent", function() {
    beforeEach(function() {
        this.model = fixtures.imageWorkfile();
        this.view = new chorus.views.AlpineWorkfileContent({ model : this.model })
    });

    describe("render", function() {
        beforeEach(function() {
            this.view.render();
        })

        it("should exist", function() {
        })
    })
});
