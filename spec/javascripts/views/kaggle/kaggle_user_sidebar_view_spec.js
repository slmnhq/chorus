describe("chorus.views.KaggleUserSidebar", function() {
    beforeEach(function() {
        this.model = rspecFixtures.kaggleUserSet().at(0);
        this.workspace = rspecFixtures.workspace();
        this.view = new chorus.views.KaggleUserSidebar({workspace: this.workspace});
        this.view.setKaggleUser(this.model);
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

        it("renders information inside the tabbed area", function() {
            expect(this.view.tabs.information).toBeA(chorus.views.KaggleUserInformation);
            expect(this.view.tabs.information.el).toBe(this.view.$(".tabbed_area .kaggle_user_information")[0]);
        });

        describe("sending a message", function() {
            beforeEach(function() {
                this.modalSpy = stubModals();
            });

            it ("links to the send message dialogue", function() {
                expect(this.view.$('a[data-dialog=ComposeKaggleMessage]')).toContainTranslation("actions.compose_kaggle_message");
            });

            it("opens the send message dialog", function() {
                var dialogLink = this.view.$("a.dialog");
                expect(dialogLink.data("recipient")).toBe(this.model);
                expect(dialogLink.data("workspace")).toBe(this.workspace);
                expect(dialogLink.data("dialog")).toBe("ComposeKaggleMessage");

            });
        })
    });
});