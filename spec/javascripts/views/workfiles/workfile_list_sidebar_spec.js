describe("WorkfileListSidebar", function() {
    beforeEach(function() {
        fixtures.model = 'Workspace';
        this.loadTemplate("workfile_list_sidebar");
        this.workspace = fixtures.modelFor("fetch");
        this.view = new chorus.views.WorkfileListSidebar({ model : this.workspace });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        })

        it("has a new workfile button", function() {
            var button = this.view.$("button:contains('Create SQL File')")
            expect(button).toExist();
            expect(button.data("workspaceId")).toBe(10013);
        })

        context("when no workfile is selected", function () {
            it("does not render the info section", function() {
                expect(this.view.$(".info")).not.toExist();
            });
        })
    })

    describe("workfile:selected event handling", function() {
        beforeEach(function() {
            fixtures.model = "Workfile";
            this.workfile = fixtures.modelFor("fetch")
            this.view.trigger("workfile:selected", this.workfile);
        })

        it("displays the selected filename", function() {
            expect(this.view.$(".fileName").text().trim()).toBe(this.workfile.get("fileName"))
        });

        it("displays the selected workfile's date", function() {
            var updatedDate = new Date(this.workfile.get("lastUpdatedStamp"));
            expect(this.view.$(".updatedOn").text().trim()).toBe(updatedDate.toString("MMMM d"));
        });

        it("displays the name of the person who updated the workfile", function() {
            var updaterName = this.workfile.get("modifiedByFirstName") + " " + this.workfile.get("modifiedByLastName");
            expect(this.view.$(".updatedBy").text().trim()).toBe(updaterName);
        });

        it("links to the profile page of the modifier", function() {
            expect(this.view.$("a.updatedBy").attr("href")).toBe("#/users/" + this.workfile.get("modifiedBy"))
        })

        it("displays a link to delete the workfile", function() {
            var deleteLink = this.view.$(".actions a[data-alert=DeleteWorkfile]");
            expect(deleteLink).toExist();
            expect(deleteLink).toHaveAttr("data-workspace-id", this.workfile.get("workspaceId"))
            expect(deleteLink).toHaveAttr("data-workfile-id", this.workfile.get("id"))
            expect(deleteLink).toHaveAttr("data-workfile-name", this.workfile.get("fileName"))
        })

        it("displays a link to copy the workfile to another workspace", function() {
            var copyLink = this.view.$(".actions a[data-dialog=CopyWorkfile]");
            expect(copyLink).toExist();
            expect(copyLink).toHaveAttr("data-workspace-id", this.workfile.get("workspaceId"))
            expect(copyLink).toHaveAttr("data-workfile-id", this.workfile.get("id"))
        })
    })
});
