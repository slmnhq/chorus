describe("chorus.views.WorkspaceMemberList", function() {
    beforeEach(function() {
        this.view = new chorus.views.WorkspaceMemberList();
    });

    describe("when there are less than 24 members", function() {
        beforeEach(function() {
            this.workspace = rspecFixtures.workspace();
            this.members = this.workspace.members();

            var members = this.workspace.members();
            _.times(3, function() {
                members.add(rspecFixtures.user());
            });

            spyOn(this.members, "fetchAllIfNotLoaded");
            chorus.PageEvents.broadcast("workspace:selected", this.workspace);
        });

        it("calls fetchIfNotLoaded on members", function() {
            expect(this.members.fetchAllIfNotLoaded).toHaveBeenCalled();
        })

        it("includes an image for each member", function() {
            var images = this.view.$(".members img");
            expect(images.length).toBe(3);
            expect(images.eq(0).attr("src")).toBe(this.members.models[0].fetchImageUrl());
            expect(images.eq(1).attr("src")).toBe(this.members.models[1].fetchImageUrl());
            expect(images.eq(2).attr("src")).toBe(this.members.models[2].fetchImageUrl());
        });

        it("has a title for each member that is their display Name", function() {
            var links = this.view.$(".members li a");
            expect(links.eq(0).attr("title")).toBe(this.members.models[0].displayName());
            expect(links.eq(1).attr("title")).toBe(this.members.models[1].displayName());
            expect(links.eq(2).attr("title")).toBe(this.members.models[2].displayName());
        })

        it("includes a link to each member's page", function() {
            var links = this.view.$(".members li a");
            expect(links.length).toBe(3);
            expect(links.eq(0).attr("href")).toBe(this.members.models[0].showUrl());
            expect(links.eq(1).attr("href")).toBe(this.members.models[1].showUrl());
            expect(links.eq(2).attr("href")).toBe(this.members.models[2].showUrl());
        });

        it("does not have the more workspace members link", function() {
            expect(this.view.$(".members a.dialog[data-dialog=WorkspaceMembersMore]").length).toBe(0)
        })
    })

    describe("when there are more than 24 members", function() {
        beforeEach(function() {
            this.workspace = rspecFixtures.workspace();
            var members = this.workspace.members();
            this.members = this.workspace.members();

            _.times(25, function() {
                members.add(rspecFixtures.user());
            });

            spyOn(this.members, "fetchAllIfNotLoaded");
            chorus.PageEvents.broadcast("workspace:selected", this.workspace);
        });

        it("calls fetchIfNotLoaded on members", function() {
            expect(this.members.fetchAllIfNotLoaded).toHaveBeenCalled();
        })

        it("only shows the first 24 images", function() {
            expect(this.view.$(".members img").length).toBe(24);
        });

        it("has a X more workspace members link", function() {
            expect(this.view.$(".members a.dialog[data-dialog=WorkspaceMembersMore]").length).toBe(1)
        });
    })
})
