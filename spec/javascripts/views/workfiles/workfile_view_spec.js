describe("chorus.views.Workfile", function() {
    beforeEach(function() {
        this.model = fixtures.sqlWorkfile({
            id: "24",
            commentCount: 1,
            recentComments: [{
                text: "my pinky hurts.",
                author: {
                    id: "1",
                    firstName: "marvin",
                    lastName: "teh_martian"
                },
                timestamp: "2011-12-15 12:34:56"
            }]
        });
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

    describe("the icon/thumbnail", function() {
        it("includes the correct workfile icon (non-image)", function() {
            spyOn(this.view.model, "isImage").andReturn(false);
            this.view.render();
            expect(this.view.$("img")).toHaveAttr("src", "/images/workfiles/large/sql.png");
        });

        it("includes the correct thumbnail (image)", function() {
            spyOn(this.view.model, "isImage").andReturn(true);
            this.view.render();
            expect(this.view.$("img")).toHaveAttr("src", this.view.model.thumbnailUrl());
        });
    });

    it("includes the most recent comment body", function() {
        expect(this.view.$(".comment .body")).toContainText(this.model.lastComment().get("body"));
    });

    it("includes the full name of the most recent commenter", function() {
        expect(this.view.$(".comment .user")).toHaveText(this.model.lastComment().author().displayName());
    });

    it("does not display the 'other comments' text", function() {
        expect(this.view.$(".comment")).not.toContainText(t("workfiles.other_comments", {count: 0}));
    });

    context("when the workfile has more than one comment", function() {
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

    it("displays the abbreviated date of the most recent comment", function() {
        expect(this.view.$(".comment_info .on").text().trim()).toBe("Dec 15");
    });
});
