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
//            spyOn(chorus.PageEvents, 'broadcast').andCallThrough();
//            this.view.options.checkable = true;
//            this.view.render();
            this.checkboxes = this.view.$("> li input[type=checkbox]");
        });

        it("displays the list of users", function() {
            expect(this.view.$("> li").length).toBe(this.collection.length);
        });

        it("displays the usernames", function() {
            expect(this.view.$(".name:contains("+ this.collection.at(0).get("username") +")")).toExist();
        });

        it("displays the location", function() {
            expect(this.view.$(".location:contains("+ this.collection.at(0).get("location") +")")).toExist();
        });

        it("displays the rank", function() {
            expect(this.view.$(".kaggle_rank:contains("+ this.collection.at(0).get("rank") +")")).toExist();
        });

        it("displays a checkbox for each kaggle user", function() {
            expect(this.checkboxes.length).toBe(this.collection.length);
        });

        it("displays the gravatar url when the user has one", function() {
            expect(this.view.$("img.profile:eq(0)")).toHaveAttr("src", this.collection.at(0).gravatarUrl);
        });

        it("displays the default gravatar image when the user does not have one", function() {
            this.collection.at(0).set({gravatarUrl: ''});
            this.view.render();
            expect(this.view.$("img.profile:eq(0)")).toHaveAttr("src", "/images/kaggle/default_user.jpeg");
        });

        it("broadcasts kaggle_user:selected when a user's entry is selected", function() {
            spyOn(chorus.PageEvents, 'broadcast').andCallThrough();
            var user = this.collection.at(0);
            this.view.itemSelected(user);
            expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("kaggle_user:selected", user);
        });
    });
});
