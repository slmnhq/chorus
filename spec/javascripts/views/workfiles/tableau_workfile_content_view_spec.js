describe("chorus.views.TableauWorkfileContent", function() {
    beforeEach(function() {
        this.model = rspecFixtures.workfile.tableau();
        this.view = new chorus.views.TableauWorkfileContent({ model : this.model })
    });

    describe("render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("creates an image tag", function() {
            var img = this.view.$("img")
            expect(img).toExist();
        });
    });
});
