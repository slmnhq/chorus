describe("chorus.views.Workfile", function() {
    beforeEach(function() {
        this.model = newFixtures.workfile.sql({ id: "24" });
        this.view = new chorus.views.Workfile({ model: this.model, activeWorkspace: true });
        this.view.render();
    });

    it("includes the data-id", function() {
        expect($(this.view.el).data("id")).toBe(24);
    });

    it("links the workfile's name to its show page", function() {
        expect(this.view.$("a.name")).toHaveText(this.model.get("fileName"));
        expect(this.view.$("a.name")).toHaveHref(this.model.showUrl());
    });

    it("includes the correct workfile icon (non-image)", function() {
        expect(this.view.$("img")).toHaveAttr("src", "/images/workfiles/large/doc.png");
    });

    // TODO: make these work with new api and fixtures
    xcontext("when the workfile has one comment", function() {
        it("includes the most recent comment body", function() {
            expect(this.view.$(".comment .body")).toContainText(this.model.lastComment().get("body"));
        });

        it("includes the full name of the most recent commenter", function() {
            expect(this.view.$(".comment .user")).toHaveText(this.model.lastComment().author().displayName());
        });

        it("does not display the 'other comments' text", function() {
            expect(this.view.$(".comment")).not.toContainText(t("workfiles.other_comments", {count: 0}));
        });

        it("displays the abbreviated date of the most recent comment", function() {
            expect(this.view.$(".comment_info .on").text().trim()).toBe("Dec 15");
        });
    });

    xcontext("when the workfile has more than one comment", function() {
        beforeEach(function() {
            this.model.set({ commentCount: 3 });
        });

        it("displays the 'other comments' text", function() {
            expect(this.view.$(".comment")).toContainText(t("workfiles.other_comments", { count: 2 }));
        });
    });

    context("when the workfile has no comments", function() {
        beforeEach(function() {
            this.model.unset("recentComments");
        });

        it("does not display the most recent comment", function() {
            expect(this.view.$(".comment")).not.toExist();
        });
    });
});
