describe("chorus.views.Activity", function() {
    beforeEach(function() {
        this.model = fixtures.activity();
        this.view = new chorus.views.Activity({ model: this.model });
    });

    describe("#headerHtml", function() {
        context("when the activity type is unknown", function() {
            it("returns a default header", function() {
                this.model.set({ type: "GEN MAI CHA" });
                expect(this.view.headerHtml()).toBeDefined();
            });
        });

        context("when the activity type is known", function() {
            beforeEach(function() {
                this.model.set({ type: "NOTE" });
                this.html = this.view.headerHtml();
            });

            it("contains the author's name", function() {
                expect(this.html).toContain(this.model.author().displayName());
            });

            it("contains the author's url", function() {
                expect(this.html).toContain(this.model.author().showUrl());
            });
        });
    });

    describe("type: NOTE", function() {
        describe("#render", function() {
            beforeEach(function() {
                this.view.render();
            });

            it("displays the image for the author", function() {
                expect(this.view.$("img").attr("src")).toBe(this.view.model.author().imageUrl());
            });

            it("displays the name of the author", function() {
               expect(this.view.$(".author").eq(0).text().trim()).toBe(this.view.model.author().displayName());
            });

            it("links the author's name to the author's show page", function() {
                expect(this.view.$("a.author").attr("href")).toBe(this.view.model.author().showUrl());
            });

            it("displays the object of the action", function() {
               expect(this.view.$(".object").text()).toContain(this.view.model.objectName());
            });

            it("links the object to the object's URL", function() {
                expect(this.view.$(".object a").attr("href")).toBe(this.view.model.objectUrl());
            });

            it("displays the name of the workspace", function() {
               expect(this.view.$(".workspace").text()).toContain(this.view.model.workspaceName());
            });

            it("links the workspace to the workspace's URL", function() {
                expect(this.view.$(".workspace a").attr("href")).toBe(this.view.model.workspaceUrl());
            });

            it("displays the comment body", function() {
               expect(this.view.$(".body").eq(0).text().trim()).toBe(this.view.model.get("text"));
            });

            it("displays the timestamp", function() {
                expect(this.view.$(".timestamp").text()).not.toBeEmpty();
            });

            it("renders items for the sub-comments", function() {
                expect(this.model.get("comments").length).toBe(1);
                expect(this.view.$(".comments li").length).toBe(1);
            });
        });
    });
});
