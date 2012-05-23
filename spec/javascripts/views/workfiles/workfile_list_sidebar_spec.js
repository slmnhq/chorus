describe("chorus.views.WorkfileListSidebar", function() {
    beforeEach(function() {
        this.workspace = newFixtures.workspace();
        this.view = new chorus.views.WorkfileListSidebar({ workspace: this.workspace });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        })

        context("when no workfile is selected", function() {
            it("does not render the info section", function() {
                expect(this.view.$(".info")).not.toExist();
            });

            it("does not render the activity stream", function() {
                expect(this.view.$(".info")).not.toExist();
            });
        })
    })

    describe("workfile:selected event handling", function() {
        context("when a workfile is selected", function() {
            context("when the workfile's workspace is active", function() {
                beforeEach(function() {
                    this.workfile = fixtures.sqlWorkfile({
                        lastUpdatedStamp: "2011-11-22 10:46:03.152"
                    });
                    chorus.PageEvents.broadcast("workfile:selected", this.workfile);
                })

                it("displays the selected filename", function() {
                    expect(this.view.$(".fileName").text().trim()).toBe(this.workfile.get("fileName"))
                });

                it("displays the selected workfile's date", function() {
                    expect(this.view.$(".updated_on").text().trim()).toBe("November 22");
                });

                it("displays the name of the person who updated the workfile", function() {
                    var updaterName = this.workfile.get("versionInfo").modifier.firstName + " " + this.workfile.get("versionInfo").modifier.lastName;
                    expect(this.view.$(".updated_by").text().trim()).toBe(updaterName);
                });

                it("links to the profile page of the modifier", function() {
                    expect(this.view.$("a.updated_by").attr("href")).toBe("#/users/" + this.workfile.get("versionInfo").modifier.id);
                })

                it("displays a link to delete the workfile", function() {
                    var deleteLink = this.view.$(".actions a[data-alert=WorkfileDelete]");
                    expect(deleteLink).toExist();
                    expect(deleteLink).toHaveAttr("data-workspace-id", this.workfile.workspace().id)
                    expect(deleteLink).toHaveAttr("data-workfile-id", this.workfile.get("id"))
                    expect(deleteLink).toHaveAttr("data-workfile-name", this.workfile.get("fileName"))
                })

                it("displays a link to copy the workfile to another workspace", function() {
                    var copyLink = this.view.$(".actions a[data-dialog=CopyWorkfile]");
                    expect(copyLink).toExist();
                    expect(copyLink).toHaveAttr("data-workspace-id", this.workfile.workspace().id)
                    expect(copyLink).toHaveAttr("data-workfile-id", this.workfile.get("id"))
                    expect(copyLink).toHaveAttr("data-active-only", 'true')
                })

                it("displays a link to download the workfile", function() {
                    var downloadLink = this.view.$(".actions a.download");
                    expect(downloadLink).toExist();
                    expect(downloadLink.attr("href")).toBe(this.workfile.downloadUrl());
                })

                context("when it is in a regular workfile list", function() {
                    it("displays a link 'add a note'", function() {
                        var addLink = this.view.$(".actions a.dialog[data-dialog=NotesNew]");
                        expect(addLink).toExist();
                        expect(addLink).toHaveAttr("data-entity-type", "workfile");
                        expect(addLink).toHaveAttr("data-entity-id", this.workfile.get("id"));
                    });
                })

                context("when it is in a search result workfile list", function() {
                    beforeEach(function() {
                        this.view.options.hideAddNoteLink = true
                        this.view.render()
                    });

                    it("does not display a link 'add a note'", function() {
                        var addLink = this.view.$(".actions a.dialog[data-dialog=NotesNew]");
                        expect(addLink).not.toExist();
                    });
                })

                it("displays the activity list", function() {
                    expect(this.view.$(".activity_list")).toExist();
                })

                it("sets the collection to the activities of the selected workfile", function() {
                    expect(this.view.collection).toBe(this.workfile.activities());
                })

                describe("when the activity set is changed", function() {
                    beforeEach(function() {
                        spyOn(this.view, 'postRender');
                    });

                    it("re-renders", function() {
                        this.view.collection.trigger("changed");
                        expect(this.view.postRender).toHaveBeenCalled();
                    });
                });

                it("displays nothing when a workfile is deselected", function() {
                    chorus.PageEvents.broadcast("workfile:deselected");
                    expect(this.view.$(".info")).not.toExist();
                });
            });
        });

        context("when the workfile's workspace is archived", function() {
            beforeEach(function() {
                this.workspace.set({archivedAt: "2011-11-22 10:46:03.152"});
                this.workfile = fixtures.sqlWorkfile({
                    lastUpdatedStamp: "2011-11-22 10:46:03.152"
                });
                chorus.PageEvents.broadcast("workfile:selected", this.workfile);
            });
            it("displays a link to copy the workfile to another workspace", function() {
                var copyLink = this.view.$(".actions a[data-dialog=CopyWorkfile]");
                expect(copyLink).toExist();
                expect(copyLink).toHaveAttr("data-workspace-id", this.workfile.workspace().id)
                expect(copyLink).toHaveAttr("data-workfile-id", this.workfile.get("id"))
                expect(copyLink).toHaveAttr("data-active-only", 'true')
            });

            it("displays a link to download the workfile", function() {
                var downloadLink = this.view.$(".actions a.download");
                expect(downloadLink).toExist();
                expect(downloadLink.attr("href")).toBe(this.workfile.downloadUrl());
            });

            it("doesn't display any other links", function() {
                expect(this.view.$('.actions a').length).toBe(2);
            });

        });
    });

    context("when no workfile is selected", function() {
        beforeEach(function() {
            this.view.workfile = "foo";
            chorus.PageEvents.broadcast("workfile:selected");
        });

        it("sets the local workfile as undefined", function() {
            expect(this.view.workfile).toBeFalsy();
        });
    });
});
