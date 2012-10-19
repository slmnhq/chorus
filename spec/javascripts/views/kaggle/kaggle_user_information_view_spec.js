describe("chorus.views.KaggleUserInformation", function() {
    beforeEach(function() {
        this.model = rspecFixtures.kaggleUserSet().at(0);
        this.model.set({favoriteTechnique: "my favorite technique"});
        this.model.set({favoriteSoftware: "javascript!"});
        this.view = new chorus.views.KaggleUserInformation({model: this.model});
        this.view.render();
    });

    it("shows the user's rank", function() {
        expect(this.view.$(".pair.rank")).toContainText(this.model.get("rank"));
    });

    it("shows the user's points", function() {
        expect(this.view.$(".pair.points")).toContainText(this.model.get("points"));
    });

    it("shows the user's entered competitions", function() {
        expect(this.view.$(".pair.number_of_entered_competitions")).toContainText(this.model.get("numberOfEnteredCompetitions"));
    });

    it("shows the user's past competition types", function() {
        expect(this.view.$(".pairs .past_competition_types .value:eq(0)")).toContainText(this.model.get("pastCompetitionTypes")[0]);
        expect(this.view.$(".pairs .past_competition_types .value").length).toEqual(this.model.get("pastCompetitionTypes").length);
    });

    it("shows the user's favorite technique", function() {
        expect(this.view.$(".pairs")).toContainTranslation("kaggle.information.favorite_technique");
        expect(this.view.$(".pairs .favorite_technique")).toContainText("my favorite technique");
    });

    it("shows the user's favorite software", function() {
        expect(this.view.$(".pairs")).toContainTranslation("kaggle.information.favorite_software");
        expect(this.view.$(".pairs .favorite_software")).toContainText("javascript!");
    });

    context("When favorite technique is not specified", function() {
        beforeEach(function() {
            this.model.set({favoriteTechnique: null});
            this.view.render();
        });
        it("doesn't show favorite technique key", function() {
            expect(this.view.$(".pairs")).not.toContainTranslation("kaggle.information.favorite_technique");
        });
    });

    context("When favorite software is not specified", function() {
        beforeEach(function() {
            this.model.set({favoriteSoftware: null});
            this.view.render();
        });
        it("doesn't show favorite software key", function() {
            expect(this.view.$(".pairs")).not.toContainTranslation("kaggle.information.favorite_software");
        });
    });
});