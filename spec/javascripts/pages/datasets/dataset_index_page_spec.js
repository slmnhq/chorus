 describe("chorus.pages.DatasetIndexPage", function() {
    beforeEach(function() {
        this.modalSpy = stubModals();
        this.workspace = fixtures.workspace({ id: 9999 });
        this.page = new chorus.pages.DatasetIndexPage(this.workspace.get("id"));
        chorus.bindModalLaunchingClicks(this.page);
    })

    it("has a helpId", function() {
        expect(this.page.helpId).toBe("datasets")
    })

    describe("#initialize", function() {
        it("fetches the model", function() {
            expect(this.server.lastFetchFor(this.workspace)).not.toBeUndefined();
        });

        it("declares required resources", function() {
            expect(this.page.requiredResources.length).toBe(1);
            expect(this.page.requiredResources.at(0)).toBe(this.page.workspace);
        });
    });

    context("it does not have a sandbox", function() {
        beforeEach(function() {
            this.workspace.attributes.sandboxInfo = null;
        });

        context("and the user is an admin", function() {
            beforeEach(function() {
                setLoggedInUser({ id: 11, admin: true});
                this.server.completeFetchFor(this.workspace);
            });

            itHandlesTheWorkspaceResponse(t("dataset.import.need_sandbox", {
                hereLink: '<a class="dialog" href="#" data-dialog="SandboxNew" data-workspace-id="9999">' + t("actions.click_here") + '</a>'
            }))
        });

        context("and the user is the workspace owner", function() {
            beforeEach(function() {
                setLoggedInUser({ id: this.workspace.get("ownerId"), admin: false});
                this.server.completeFetchFor(this.workspace);
            });

            itHandlesTheWorkspaceResponse(t("dataset.import.need_sandbox", {
                hereLink: '<a class="dialog" href="#" data-dialog="SandboxNew" data-workspace-id="9999">' + t("actions.click_here") + '</a>'
            }))
        });

        context("and the user is neither an admin nor the workspace owner", function() {
            beforeEach(function() {
                setLoggedInUser({ id: "888", admin: false});
                this.server.completeFetchFor(this.workspace);
            });

            itHandlesTheWorkspaceResponse(t("dataset.import.need_sandbox_no_permissions"))
        });

        function itHandlesTheWorkspaceResponse(helpText) {
            it("fetches the dataset collection", function() {
                expect(this.workspace.sandbox()).toBeUndefined();
                expect(this.server.lastFetchFor(this.page.collection)).toBeDefined();
            })

            describe("when the fetch returns no items", function() {
                beforeEach(function() {
                    this.datasets = [
                    ];
                    this.server.lastFetchFor(this.page.collection).succeed(this.datasets);
                })

                it("has no items", function() {
                    expect(this.page.collection.length).toBe(0)
                })
            });

            describe("when the fetch returns two items", function() {
                beforeEach(function() {
                    this.datasets = [
                        fixtures.datasetSourceTable(),
                        fixtures.datasetSourceView()
                    ];
                    this.server.lastFetchFor(this.page.collection).succeed(this.datasets);
                })

                it("has two items", function() {
                    expect(this.page.collection.length).toBe(2)
                })
            });

            describe("the import file button", function() {
                beforeEach(function() {
                    this.page.render();
                })

                it("is disabled", function() {
                    expect(this.page.mainContent.contentDetails.$("button")).toBeDisabled();
                })

                it("has a help icon", function() {
                    expect(this.page.mainContent.contentDetails.$('img.help')).toExist();
                })

                it("has the correct help text", function() {
                    expect(this.page.mainContent.contentDetails.$("img.help").attr("data-text")).toBe(helpText);
                })
            })
        }
    });

    context("after the workspace has loaded", function() {
        beforeEach(function() {
            spyOn(this.page.collection, 'fetch').andCallThrough();
            this.server.completeFetchFor(this.workspace);
            this.account = this.workspace.sandbox().instance().accountForCurrentUser();
        });

        it("fetches the collection when csv_import:started is triggered", function() {
            chorus.PageEvents.broadcast("csv_import:started");
            expect(this.page.collection.fetch).toHaveBeenCalled();
        });

        context("it has a sandbox", function() {

            it("fetches the account for the current user", function() {
                expect(this.server.lastFetchFor(this.account)).not.toBeUndefined();
            });

            describe("the 'import file' button", function() {
                beforeEach(function() {
                    this.page.render();
                });

                it("has the right text", function() {
                    expect(this.page.$("button[data-dialog='DatasetImport']").text()).toMatchTranslation("dataset.import.title");
                });

                it("has the right data attributes", function() {
                    expect(this.page.$("button[data-dialog='DatasetImport']").data("workspaceId").toString()).toBe(this.workspace.id.toString());
                    expect(this.page.$("button[data-dialog='DatasetImport']").data("canonicalName")).toBe(this.workspace.sandbox().canonicalName());
                });

                describe("when the button is clicked", function() {
                    beforeEach(function() {
                        this.page.$("button[data-dialog='DatasetImport']").click();
                    });

                    it("launches an Import File dialog", function() {
                        expect(this.modalSpy).toHaveModal(chorus.dialogs.DatasetImport);
                    });
                });
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

                it("pops up a WorkspaceInstanceAccount dialog", function() {
                    expect(this.modalSpy).toHaveModal(chorus.dialogs.WorkspaceInstanceAccount);
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
                        this.modalSpy.reset();
                        this.page = new chorus.pages.DatasetIndexPage(this.workspace.get("id"));
                        this.server.completeFetchFor(this.workspace);
                        this.server.completeFetchFor(this.page.account, fixtures.emptyInstanceAccount())
                    });

                    it("should not pop up the WorkspaceInstanceAccountDialog", function() {
                        expect(this.modalSpy).not.toHaveBeenCalled();
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
                    expect(this.modalSpy).not.toHaveBeenCalled();
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

    });

    describe("when the workfile:selected event is triggered on the list view", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.workspace);
            this.page.render();

            this.dataset = fixtures.datasetSourceTable();
            chorus.PageEvents.broadcast("dataset:selected", this.dataset);
        })

        it("sets the selected dataset as its own model", function() {
            expect(this.page.model).toBe(this.dataset);
        });
    });
});
