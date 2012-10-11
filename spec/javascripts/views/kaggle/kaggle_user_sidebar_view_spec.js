describe("chorus.views.KaggleUserSidebar", function() {
    beforeEach(function() {
        this.model = rspecFixtures.kaggleUserSet().at(0);
        this.view = new chorus.views.KaggleUserSidebar();
        this.view.render();
    });

    context("with a user", function() {
        beforeEach(function() {
            chorus.PageEvents.broadcast('kaggle_user:selected', this.model);
        });

        it("shows the user's name", function() {
            expect(this.view.$(".info .name")).toContainText(this.model.get("fullName"));
        });

        it("shows the user's location", function() {
            expect(this.view.$(".location")).toContainText(this.model.get("location"));
        });
    });
});