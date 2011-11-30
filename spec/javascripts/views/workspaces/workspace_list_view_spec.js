describe("chorus.views.WorkspaceList", function() {
    beforeEach(function() {
        this.loadTemplate("workspace_list");

        this.activeWorkspace = new chorus.models.Workspace({id: 1, active: true, name: "my active workspace"});
        this.archivedWorkspace = new chorus.models.Workspace({id: 2, active: false, name: "my archived workspace"});
        this.publicWorkspace = new chorus.models.Workspace({id: 4, isPublic: true, name: "my public workspace"});
        this.privateWorkspace = new chorus.models.Workspace({
            id: 3,
            isPublic: false,
            active: true,
            ownerFullName: "Dr Mario",
            name: "my private workspace"
        });

        this.collection = new chorus.models.WorkspaceSet([
            this.activeWorkspace,
            this.archivedWorkspace,
            this.privateWorkspace,
            this.publicWorkspace
        ]);
        this.view = new chorus.views.WorkspaceList({collection: this.collection});
    });

    describe("#render", function(){
        beforeEach(function(){
            this.view.render();
            this.activeEl = this.view.$("li[data-id=1]");
            this.archivedEl = this.view.$("li[data-id=2]");
            this.privateEl = this.view.$("li[data-id=3]");
            this.publicEl = this.view.$("li[data-id=4]");
        });

        it("displays all the workspaces", function(){
            expect(this.view.$("li").length).toBe(4);
        });

        it("sets title attributes for the workspace names", function() {
            var self = this;

            _.each(this.view.$("a.name span"), function(el, index) {
                expect($(el).attr("title")).toBe(self.collection.at(index).get("name"));
            })
        })

        it("displays the active workspace icon for the active workspace", function(){
            expect(this.view.$("li[data-id=1] img").attr("src")).toBe(this.activeWorkspace.defaultIconUrl());
        });

        it("displays the archived workspace icon for the archived workspace", function(){
            expect($("img", this.archivedEl).attr("src")).toBe(this.archivedWorkspace.defaultIconUrl());
        });

        it("links the workspace name to the show url", function(){
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
    });
});
