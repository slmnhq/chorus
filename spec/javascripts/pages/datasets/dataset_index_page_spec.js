describe("chorus.pages.DatasetIndexPage", function() {
    beforeEach(function() {
        this.workspace = fixtures.workspace();
        spyOn(chorus.Modal.prototype, 'launchModal');
        this.page = new chorus.pages.DatasetIndexPage(this.workspace.get("id"));
    })

    describe("#initialize", function() {
        it("fetches the model", function() {
            expect(this.server.lastFetchFor(this.workspace)).not.toBeUndefined();
        });
    });

    context("after the workspace has loaded", function() {
        beforeEach(function() {
            spyOn(this.page.collection, 'fetch').andCallThrough();
            this.server.completeFetchFor(this.workspace);
            this.account = this.workspace.sandbox().instance().accountForCurrentUser();
        });

        it("fetches the account for the current user", function() {
            expect(this.server.lastFetchFor(this.account)).not.toBeUndefined();
        });

        context("when the account loads and is empty", function() {
            beforeEach(function() {
                spyOnEvent(this.page.collection, 'reset');
                this.server.completeFetchFor(this.account, fixtures.emptyInstanceAccount())
            })

            it("does not fetch the datasets for the workspace, and marks it as loaded", function() {
                //TODO This is due to the api throwing an error.  Once this is fixed we should be fetching during setup: https://www.pivotaltracker.com/story/show/24237643
                expect(this.server.lastFetchFor(this.page.collection)).toBeUndefined();
                expect(this.page.collection.loaded).toBeTruthy();
                expect('reset').toHaveBeenTriggeredOn(this.page.collection);
            });

            it("pops up the WorkspaceInstanceAccountDialog", function() {
                expect(chorus.Modal.prototype.launchModal).toHaveBeenCalled();
                expect(this.page.dialog.model).toBe(this.page.account);
                expect(this.page.dialog.pageModel).toBe(this.page.workspace);
            });

            context("after the account has been created", function() {
                beforeEach(function() {
                    this.page.account.trigger('saved');
                });

                it("fetches the datasets", function() {
                    expect(this.page.collection.fetch).toHaveBeenCalled();
                })
            });

            context('navigating to the page a second time', function() {
                beforeEach(function() {
                    this.server.reset();
                    chorus.Modal.prototype.launchModal.reset();
                    this.page = new chorus.pages.DatasetIndexPage(this.workspace.get("id"));
                    this.server.completeFetchFor(this.workspace);
                    this.server.completeFetchFor(this.page.account, fixtures.emptyInstanceAccount())
                });

                it("should not pop up the WorkspaceInstanceAccountDialog", function() {
                    expect(chorus.Modal.prototype.launchModal).not.toHaveBeenCalled();
                });

                it("fetches the datasets for the workspace", function() {
                    //TODO This is due to the api throwing an error.  Once this is fixed we should be fetching during setup: https://www.pivotaltracker.com/story/show/24237643
                    expect(this.server.lastFetchFor(this.page.collection)).not.toBeUndefined();
                });
            });
        });

        context("when the account loads and is valid", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.account, fixtures.instanceAccount())
            })

            it("fetches the datasets for the workspace", function() {
                //TODO This is due to the api throwing an error.  Once this is fixed we should be fetching during setup: https://www.pivotaltracker.com/story/show/24237643
                expect(this.server.lastFetchFor(this.page.collection)).not.toBeUndefined();
            });

            it("does not pop up the WorkspaceInstanceAccountDialog", function() {
                expect(chorus.Modal.prototype.launchModal).not.toHaveBeenCalled();
            })

            describe("filtering", function() {
                beforeEach(function() {
                    this.page.render();
                    this.page.collection.type = undefined;
                })

                it("has options for filtering", function() {
                    expect(this.page.$("ul[data-event=filter] li[data-type=]")).toExist();
                    expect(this.page.$("ul[data-event=filter] li[data-type=SOURCE_TABLE]")).toExist();
                    expect(this.page.$("ul[data-event=filter] li[data-type=CHORUS_VIEW]")).toExist();
                    expect(this.page.$("ul[data-event=filter] li[data-type=SANDBOX_TABLE]")).toExist();
                })

                it("can filter the list by 'all'", function() {
                    this.page.$("li[data-type=] a").click();
                    expect(this.page.collection.attributes.type).toBe("");
                    expect(this.page.collection.fetch).toHaveBeenCalled();
                })

                it("has can filter the list by 'SOURCE_TABLE'", function() {
                    this.page.$("li[data-type=SOURCE_TABLE] a").click();
                    expect(this.page.collection.attributes.type).toBe("SOURCE_TABLE");
                    expect(this.page.collection.fetch).toHaveBeenCalled();
                    expect(this.server.lastFetch().url).toContain("/edc/workspace/" + this.workspace.get("id") + "/dataset?type=SOURCE_TABLE");
                })

                it("has can filter the list by 'SANBOX_TABLE'", function() {
                    this.page.$("li[data-type=SANDBOX_TABLE] a").click();
                    expect(this.page.collection.attributes.type).toBe("SANDBOX_TABLE");
                    expect(this.page.collection.fetch).toHaveBeenCalled();
                    expect(this.server.lastFetch().url).toContain("/edc/workspace/" + this.workspace.get("id") + "/dataset?type=SANDBOX_TABLE");

                })

                it("has can filter the list by 'CHORUS_VIEW'", function() {
                    this.page.$("li[data-type=CHORUS_VIEW] a").click();
                    expect(this.page.collection.attributes.type).toBe("CHORUS_VIEW");
                    expect(this.page.collection.fetch).toHaveBeenCalled();
                    expect(this.server.lastFetch().url).toContain("/edc/workspace/" + this.workspace.get("id") + "/dataset?type=CHORUS_VIEW");

                })
            });
        });

    });

    describe("when the workfile:selected event is triggered on the list view", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.workspace);
            this.page.render();

            this.dataset = fixtures.datasetSourceTable();
            var listView = this.page.mainContent.content;
            spyOnEvent(this.page.sidebar, 'dataset:selected');
            listView.trigger("dataset:selected", this.dataset);
        })

        it("triggers the event on the sidebar view", function() {
            expect('dataset:selected').toHaveBeenTriggeredOn(this.page.sidebar, [ this.dataset ]);
        });

        it("sets the selected dataset as its own model", function() {
            expect(this.page.model).toBe(this.dataset);
        });
    });
});
