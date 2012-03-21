describe("chorus.views.UserListSidebar", function() {
    beforeEach(function() {
        spyOn(chorus.views.UserListSidebar.prototype, "setUser").andCallThrough();

        this.model = fixtures.user({ title: "Supreme Test-Driver" });
        this.view = new chorus.views.UserListSidebar({ model: this.model });
        this.view.render();
    });

    it("displays the user's name and title'", function() {
        expect(this.view.$(".full_name")).toHaveText(this.model.displayName());
        expect(this.view.$(".title")).toHaveText(this.model.get("title"));
    });

    it("fetches the user's activities", function() {
        expect(this.model.activities()).toHaveBeenFetched();
    });

    describe("#setUser(user)", function() {
        beforeEach(function() {
            this.otherModel = fixtures.user({ title: "Lame Test-Driver" })
            this.view.setUser(this.otherModel);
        });

        it("shows the new user's name and title'", function() {
            expect(this.view.$(".full_name")).toHaveText(this.otherModel.displayName());
            expect(this.view.$(".title")).toHaveText(this.otherModel.get("title"));
        });

        it("fetches the other user's activities'", function() {
            expect(this.otherModel.activities()).toHaveBeenFetched();
        });

        it("is called when user:selected is triggered", function() {
            this.view.setUser.reset();
            chorus.PageEvents.broadcast("user:selected", fixtures.user());
            expect(this.view.setUser).toHaveBeenCalled();
        });
    });

    describe("when the fetch for the user's activities completes", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.model.activities(), [
                fixtures.activities.WORKFILE_CREATED(),
                fixtures.activities.NOTE_ON_INSTANCE(),
                fixtures.activities.NOTE_ON_CHORUS_VIEW()
            ]);
        });

        it("shows the user's activities", function() {
            expect(this.view.$(".activity_list > ul > li").length).toBe(3);
        });
    });

    it("doesn't blow up when instantiated with no user", function() {
        this.view = new chorus.views.UserListSidebar();
        expect("we didn't blow up").toBeTruthy();
    });
});
