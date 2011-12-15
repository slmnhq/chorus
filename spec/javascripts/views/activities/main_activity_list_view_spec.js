describe("chorus.views.MainActivityList", function() {
    beforeEach(function() {
        this.activity1 = new chorus.models.Activity({type: "NOTE"});
        this.activity2 = new chorus.models.Activity({type: "NOTE"});
        this.collection = new chorus.models.ActivitySet([this.activity1, this.activity2]);
        this.view = new chorus.views.MainActivityList({collection: this.collection});
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("renders an li for each item in the collection", function() {
            expect(this.view.$("li").length).toBe(this.collection.length);
        });
    });
});
