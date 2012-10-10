describe("chorus.views.KaggleUserList", function() {
    beforeEach(function() {
        this.collection = rspecFixtures.kaggleUserSet();
    });

    it("is a selectable list", function() {
        expect(new chorus.views.KaggleUserList({collection: this.collection})).toBeA(chorus.views.SelectableList);
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view = new chorus.views.KaggleUserList({collection: this.collection});
            this.view.render();
        });

        it("displays the list of users", function() {
            expect(this.view.$("> li").length).toBe(this.collection.length);
        });

        it("displays the usernames", function() {
            expect(this.view.$(".name:contains("+ this.collection.at(0).get("username") +")")).toExist();
        });

        it("broadcasts kaggle_user:selected when a user's entry is selected", function() {
            spyOn(chorus.PageEvents, 'broadcast').andCallThrough();
            var user = this.collection.at(0);
            this.view.itemSelected(user);
            expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("kaggle_user:selected", user);
        });
    });
});
