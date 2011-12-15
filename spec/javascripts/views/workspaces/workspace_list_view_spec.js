describe("chorus.views.WorkspaceList", function() {
    beforeEach(function() {
        this.activeWorkspace = new chorus.models.Workspace({id: 1, active: true, name: "my active workspace"});
        this.archivedWorkspace = new chorus.models.Workspace({
            id: 2,
            active: false,
            name: "my archived workspace",
            archiverFirstName: "John",
            archiverLastName: "Henry",
            summary: " this is an archived workspace",
            archivedTimestamp: "2011-12-05 13:25:25.704"
        });


        this.publicWorkspace = new chorus.models.Workspace({id: 4, isPublic: true, name: "my public workspace"});
        this.privateWorkspace = new chorus.models.Workspace({
            id: 3,
            isPublic: false,
            active: true,
            ownerFullName: "Dr Mario",
            name: "my private workspace"
        });


        this.archivedBigSummaryWorkspace = new chorus.models.Workspace({
            id: 5,
            active: false,
            name: "my archived workspace",
            archiverFirstName: "John",
            archiverLastName: "Henry",
            summary: "this is an archived big summary workspace this is an big summary archived workspace this is an archived workspace this is an archived workspace " +
                "this is an archived workspace this is an archived workspace this is an archived workspace this is an archived workspace  this is an archived workspace"
        });

        this.collection = new chorus.models.WorkspaceSet([
            this.activeWorkspace,
            this.archivedWorkspace,
            this.privateWorkspace,
            this.publicWorkspace,
            this.archivedBigSummaryWorkspace
        ]);

        this.view = new chorus.views.WorkspaceList({collection: this.collection});
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
            this.activeEl = this.view.$("li[data-id=1]");
            this.archivedEl = this.view.$("li[data-id=2]");
            this.privateEl = this.view.$("li[data-id=3]");
            this.publicEl = this.view.$("li[data-id=4]");
            this.archivedBigSummaryEl = this.view.$("li[data-id=5]");
        });

        it("displays all the workspaces", function() {
            expect(this.view.$("li").length).toBe(5);
        });

        it("sets title attributes for the workspace names", function() {
            var self = this;

            _.each(this.view.$("a.name span"), function(el, index) {
                expect($(el).attr("title")).toBe(self.collection.at(index).get("name"));
            })
        })

        it("links the workspace name to the show url", function() {
            expect($("a", this.activeEl).text().trim()).toBe(this.activeWorkspace.get("name"));
            expect($("a", this.activeEl).attr("href")).toBe(this.activeWorkspace.showUrl());
        });

        it("indicates which workspaces are private", function() {
            expect(this.privateEl.text()).toContain(t("workspaces.private"));
            expect(this.publicEl.text()).not.toContain(t("workspaces.private"));

            expect($("img[src='/images/workspace-lock.png']", this.privateEl)).toExist();
            expect($("img[src='/images/workspace-lock.png']", this.publicEl)).not.toExist();
        });

        it("includes the owner's name", function() {
            expect($(".owner", this.privateEl).text()).toContain(this.privateWorkspace.get("ownerFullName"));
        });

        it("links to the owner's profile", function() {
            expect($(".owner a", this.privateEl).attr('href')).toBe(this.privateWorkspace.owner().showUrl());
        });

        it("displays the truncated summary when it's not empty", function() {
            expect($(".summary", this.archivedEl).text().trim()).toContain(this.archivedWorkspace.get("summary").trim())
        });

        describe("when the summary is less than 100", function() {

            it("displays the truncated summary without option 'More' ", function() {
                expect($(".summary", this.archivedEl).text().trim()).toContain(this.archivedWorkspace.get("summary").trim());
                expect($(".summary a", this.archivedEl)).not.toHaveClass("moreLink");
            });
        });

        describe("when the summary is more than 100", function() {
            it("displays the truncated summary with option 'More' ", function() {
                expect($(this.archivedBigSummaryEl)).not.toHaveClass("more");
                expect($(".summary", this.archivedBigSummaryEl).text().trim()).toContain(this.archivedBigSummaryWorkspace.get("summary").substring(0, 100).trim());
            });

            it("displays the full summary with option 'Less' when clicked on More ", function() {
                expect($(this.archivedBigSummaryEl)).not.toHaveClass("more");
                $(".summary .truncated a.link ", this.archivedBigSummaryEl).click();
                expect($(this.archivedBigSummaryEl)).toHaveClass("more");
                expect($(".summary", this.archivedBigSummaryEl).text()).toContain(this.archivedBigSummaryWorkspace.get("summary"));
            });
        });
        describe("archived workspace", function() {
            it("displays the active workspace icon for the active workspace", function() {
                expect(this.view.$("li[data-id=1] img").attr("src")).toBe(this.activeWorkspace.defaultIconUrl());
            });

            it("displays the archived workspace icon for the archived workspace", function() {
                expect($("img", this.archivedEl).attr("src")).toBe(this.archivedWorkspace.defaultIconUrl());
            });

            it("displays the archiver FullName for the archived workspace", function() {
                expect($(".owner a", this.archivedEl).text()).toContain(this.archivedWorkspace.archiver().get("fullName"));
            });

            it("links to the archiver's profile", function() {
                expect($(".owner a", this.archivedEl).attr('href')).toBe(this.archivedWorkspace.archiver().showUrl());
            });

            it("displays archived relative time", function() {
                var whackyDateFormat = (2).hours().ago().toString("yyyy-MM-dd HH:mm:ss") + ".001"
                this.archivedWorkspace.set({"archivedTimestamp": whackyDateFormat})
                this.view.render();
                expect($(".timestamp", this.view.$("li[data-id=2]")).text()).toBe("2 hours ago");
            });
        });
    });
});
