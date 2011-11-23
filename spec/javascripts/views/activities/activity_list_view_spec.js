describe("chorus.views.ActivityList", function() {
    beforeEach(function() {
        this.loadTemplate("activity_list");
        fixtures.model = 'ActivitySet';
    });

    describe("#render", function() {
        beforeEach(function() {
            this.collection = fixtures.modelFor('fetch');
            this.view = new chorus.views.ActivityList({collection: this.collection});
        });

        describe("before the collection has loaded", function() {
            beforeEach(function() {
                this.view.render();
            })

            it("has a loading indicator", function() {
                expect(this.view.$(".loading")).toExist();
            });
        });

        describe("when the collection has loaded", function() {
            beforeEach(function() {
                this.collection.loaded = true;
                this.view.render();
            });

            it("should not have a loading element", function() {
                expect(this.view.$(".loading")).not.toExist();
            });

            it("displays the list of activities", function() {
                expect(this.view.$("> li").length).toBe(2);
            });
        });
    })
});
