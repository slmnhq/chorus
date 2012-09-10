describe("chorus.views.HdfsEntrySidebar", function() {
    beforeEach(function() {
        this.view = new chorus.views.HdfsEntrySidebar({hadoopInstanceId: 123});
    });

    describe("#render", function() {
        context("when the model is a directory", function() {
            beforeEach(function() {
                this.hdfsEntry = fixtures.hdfsEntryDir();
                chorus.PageEvents.broadcast("hdfs_entry:selected", this.hdfsEntry);
            });

            itHasTheRightDefaultBehavior(false);

            it("does not have a link to add a note", function() {
                expect(this.view.$("a.dialog.add_note")).not.toExist();
            });

            it("has a link to create an external table", function() {
                expect(this.view.$("a.directory_external_table")).toExist();
                expect(this.view.$("a.directory_external_table").text()).toMatchTranslation("hdfs_instance.create_directory_external_table")
            });

            it("calls the base implementation for postRender", function() {
                spyOn(chorus.views.Sidebar.prototype, "postRender");
                this.view.render();
                expect(chorus.views.Sidebar.prototype.postRender).toHaveBeenCalled();
            });
        });

        context("when the model is a non-binary file", function() {
            beforeEach(function() {
                // set up page to catch launch dialog click
                var page = new chorus.pages.Base();
                $(page.el).append(this.view.el);
                chorus.bindModalLaunchingClicks(page);

                this.modalSpy = stubModals();

                this.hdfsEntry = new chorus.models.HdfsEntry({
                    id: 55,
                    hadoopInstance: {
                        id: 123
                    },
                    path: "/foo",
                    name: "my_file.sql",
                    isBinary: false
               })

                chorus.PageEvents.broadcast("hdfs_entry:selected", this.hdfsEntry);
            });

            itHasTheRightDefaultBehavior(true);

            it("adds the entity id", function() {
                expect(this.view.$("a.add_note").attr("data-entity-id")).toBe("55");
            });


            context("when the file is at root", function() {
                beforeEach(function() {
                    this.view = new chorus.views.HdfsEntrySidebar({rootPath: "/", hadoopInstanceId: 123});

                    this.hdfsEntry = new chorus.models.HdfsEntry({
                        hadoopInstance: {
                            id: '123'
                        },
                        id: '55',
                        path: '/',
                        name: 'my_file.sql',
                        isBinary: false
                    });

                    chorus.PageEvents.broadcast("hdfs_entry:selected", this.hdfsEntry);
                });

                it("launches the dialog with right HdfsFile", function() {
                    this.view.$('a.external_table').click();
                    this.server.completeFetchFor(this.hdfsEntry);

                    expect(this.modalSpy).toHaveModal(chorus.dialogs.CreateExternalTableFromHdfs)
                    expect(chorus.modal.model.get("path")).toBe("/");
                });
            });

            context("when file is in subdirectory", function() {
                beforeEach(function() {
                    this.hdfsEntry = new chorus.models.HdfsEntry({
                        hadoopInstance: {
                            id: '123'
                        },
                        id: '55',
                        path: '/foo',
                        name: 'my_file.sql',
                        isBinary: false
                    });
                    chorus.PageEvents.broadcast("hdfs_entry:selected", this.hdfsEntry);
                });

                it("launches the dialog with right HdfsFile", function() {
                    this.view.$('a.external_table').click();
                    this.server.completeFetchFor(this.hdfsEntry);

                    expect(this.modalSpy).toHaveModal(chorus.dialogs.CreateExternalTableFromHdfs);
                    expect(chorus.modal.model.get("path")).toBe("/foo");
                    expect(chorus.modal.model.get("hdfs_entry_id")).toBe('55');
                });
            });
        });

        context("when the model is a binary file", function() {
            beforeEach(function() {
                // set up page to catch launch dialog click
                var page = new chorus.pages.Base();
                $(page.el).append(this.view.el);
                chorus.bindModalLaunchingClicks(page);

                this.modalSpy = stubModals();

                this.hdfsEntry = new chorus.models.HdfsEntry({
                    hadoopInstance: {
                        id: 111
                    },
                    path: "/",
                    name: "my_file.exe",
                    isBinary: true
                })

                chorus.PageEvents.broadcast("hdfs_entry:selected", this.hdfsEntry);
            });

            it("does not have a create external table link", function() {
                expect(this.view.$("a.external_table")).not.toExist();
            });
        });

        context("when there is no model", function() {
            it("does not render anything", function() {
                this.view.render();
                expect(this.view.$(".info")).not.toExist();
                expect(this.view.$(".actions")).not.toExist();
            });
        });
    });

    function itHasTheRightDefaultBehavior(withActivities) {
        it("should display the file name", function() {
            expect(this.view.$(".info .name").text()).toBe(this.hdfsEntry.get("name"));
        });

        it("should display the last updated timestamp", function() {
            var when = chorus.helpers.relativeTimestamp(this.hdfsEntry.get("lastUpdatedStamp"));
            expect(this.view.$(".info .last_updated").text().trim()).toMatchTranslation("hdfs.last_updated", {when: when});
        });

        if (withActivities) {
            it("shows the activity stream", function() {
                expect(this.view.$(".tab_control")).not.toHaveClass("hidden")
            });

            it("fetches the activity list", function() {
                expect(this.view.tabs.activity.collection).toHaveBeenFetched();
            });

            it("re-fetches when csv_import:started is broadcast", function() {
                this.server.reset();
                chorus.PageEvents.broadcast("csv_import:started");
                expect(this.view.tabs.activity.collection).toHaveBeenFetched();
            })
        } else {
            it("does not fetch the activity list", function() {
                expect(this.view.tabs.activity).toBeUndefined();
            });

            it("hides the activity stream", function() {
                expect(this.view.$(".tab_control")).toHaveClass("hidden")
            });
        }
    }
})
