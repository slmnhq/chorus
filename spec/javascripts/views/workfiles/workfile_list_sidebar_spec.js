describe("WorkfileListSidebar", function() {
    beforeEach(function() {
        fixtures.model = 'Workspace';
        this.loadTemplate("workfile_list_sidebar");
        this.loadTemplate("activity_list")
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
            
            it("does not render the activity stream", function() {
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
            expect(this.view.$(".updated_on").text().trim()).toBe("November 22");
        });

        it("displays the name of the person who updated the workfile", function() {
            var updaterName = this.workfile.get("modifiedByFirstName") + " " + this.workfile.get("modifiedByLastName");
            expect(this.view.$(".updated_by").text().trim()).toBe(updaterName);
        });

        it("links to the profile page of the modifier", function() {
            expect(this.view.$("a.updated_by").attr("href")).toBe("#/users/" + this.workfile.get("modifiedById"))
        })

        it("displays a link to delete the workfile", function() {
            var deleteLink = this.view.$(".actions a[data-alert=WorkfileDelete]");
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

        it("displays a link to download the workfile", function() {
            var downloadLink = this.view.$(".actions a.download");
            expect(downloadLink).toExist();
            expect(downloadLink).toHaveAttr("data-workspace-id", this.workfile.get("workspaceId"))
            expect(downloadLink).toHaveAttr("data-workfile-id", this.workfile.get("id"))
        })

        it("clicking download does not do anything unless fetch has succeeded ",function(){
            var downloadLink = this.view.$(".actions a.download");
            expect(downloadLink).toExist();
            expect(downloadLink).toHaveAttr("href",  "javascript:void(0)");

        })

        it("displays the activity list", function() {
            expect(this.view.$(".activity_list")).toExist();
        })

        context("workfile has been fetched", function() {
            beforeEach(function() {
                this.view.setDownloadUrl();
            })
            it("download the correct file", function() {
                var downloadLink = this.view.$(".actions a.download");
                expect(downloadLink).toHaveAttr("href", "/edc/workspace/" + this.workfile.get("workspaceId") + "/workfile/" + this.workfile.get("id") + "/file/" + this.workfile.get("versionFileId") + "?download=true")
            })
        })
    })
});
