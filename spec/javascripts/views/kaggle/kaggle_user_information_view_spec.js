describe("chorus.views.KaggleUserInformation", function() {
    beforeEach(function() {
        this.model = rspecFixtures.kaggleUserSet().at(0);
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
        expect(this.view.$(".pair.past_competition_types .value:eq(0)")).toContainText(this.model.get("pastCompetitionTypes")[0]);
        expect(this.view.$(".pair.past_competition_types .value").length).toEqual(this.model.get("pastCompetitionTypes").length);
    });
});