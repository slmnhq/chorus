describe("chorus.pages.WorkfileIndexPage", function() {
    beforeEach(function() {
        this.workspace = newFixtures.workspace();
        this.model = fixtures.sqlWorkfile({workspaceId: this.workspace.get('id')});
        this.page = new chorus.pages.WorkfileIndexPage(this.model.get('workspaceId'));
    });

    it("has a helpId", function() {
        expect(this.page.helpId).toBe("workfiles")
    })

    describe("breadcrumbs", function() {
        beforeEach(function() {
            this.workspace.set({name: "Cool Workspace"});
            this.server.completeFetchFor(this.workspace);
            this.server.completeFetchFor(this.page.collection);
            this.page.render();
        });

        it("renders home > Workspaces > {workspace name} > All work files", function() {
            expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
            expect(this.page.$(".breadcrumb:eq(0) a").text()).toMatchTranslation("breadcrumbs.home");

            expect(this.page.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/workspaces");
            expect(this.page.$(".breadcrumb:eq(1) a").text()).toMatchTranslation("breadcrumbs.workspaces");

            expect(this.page.$(".breadcrumb:eq(2) a").attr("href")).toBe("#/workspaces/" + this.model.get('workspaceId'));
            expect(this.page.$(".breadcrumb:eq(2) a").text()).toBe("Cool Workspace");

            expect(this.page.$(".breadcrumb:eq(3)").text().trim()).toMatchTranslation("breadcrumbs.workfiles.all");
        });

        context("with a long workspace name", function() {
            beforeEach(function() {
                this.page.mainContent.model.set({name: "LongLongLongLongLongWorkspaceName"});
                this.page.render();
            });

            it("ellipsizes the workspace name in the breadcrumb view", function() {
                expect(this.page.$(".breadcrumb:eq(2) a").attr("href")).toBe("#/workspaces/" + this.model.get('workspaceId'));
                expect(this.page.$(".breadcrumb:eq(2) a").text()).toBe("LongLongLongLongLong...");
            });
        });
    });

    describe("#setup", function() {
        it("fetches the model", function() {
            expect(this.server.requests[0].url).toBe("/workspace/" + this.model.get('workspaceId'));
        });

        it("sets the workspace id, for prioritizing search", function() {
            expect(this.page.workspaceId).toBe(this.workspace.get("id"));
        });

        it("defaults to alphabetical sorting ascending", function() {
            expect(this.page.collection.order).toBe("fileName");
        });

        it("defaults to all files", function() {
            expect(this.page.collection.fileType).toBe("");
        });

        it("fetches the entire collection", function() {
            expect(this.page.collection).toHaveAllBeenFetched();
        });

        it("goes to 404 when the workspace fetch fails", function() {
            spyOn(Backbone.history, "loadUrl");
            this.server.lastFetchFor(this.page.workspace).failNotFound();
            expect(Backbone.history.loadUrl).toHaveBeenCalledWith("/invalidRoute")
        });
    });

    describe("when the workfile:selected event is triggered on the list view", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.workspace);
            this.page.render();
        });

        it("sets the model of the page", function() {
            chorus.PageEvents.broadcast("workfile:selected", this.model);
            expect(this.page.model).toBe(this.model);
        });
    });

    describe("search", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.workspace);
            this.server.completeFetchAllFor(this.page.collection, [fixtures.workfile({fileName: "bar"}), fixtures.workfile({fileName: "foo"})]);
        });

        it("should have set up search correctly", function() {
            expect(this.page.$(".list_content_details .count")).toContainTranslation("entity.name.Workfile", {count: 2});
            expect(this.page.$("input.search")).toHaveAttr("placeholder", t("workfile.search_placeholder"));
            expect(this.page.$(".list_content_details .explore")).toContainTranslation("actions.explore");

            this.page.$("input.search").val("bar").trigger("keyup");

            expect(this.page.$("li.workfile:eq(1)")).toHaveClass("hidden");
            expect(this.page.$(".list_content_details .count")).toContainTranslation("entity.name.Workfile", {count: 1});
            expect(this.page.mainContent.options.search.eventName).toBe("workfile:search");

        });
    });

    describe("menus", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.workspace);
            this.server.completeFetchFor(this.page.collection);
        });

        describe("filtering", function() {
            beforeEach(function() {
                this.page.collection.fileType = undefined;
                spyOn(this.page.collection, "fetchAll");
            })

            it("has options for filtering", function() {
                expect(this.page.$("ul[data-event=filter] li[data-type=]")).toExist();
                expect(this.page.$("ul[data-event=filter] li[data-type=SQL]")).toExist();
                expect(this.page.$("ul[data-event=filter] li[data-type=CODE]")).toExist();
                expect(this.page.$("ul[data-event=filter] li[data-type=TEXT]")).toExist();
                expect(this.page.$("ul[data-event=filter] li[data-type=OTHER]")).toExist();
            })

            it("can filter the list by 'all'", function() {
                this.page.$("li[data-type=] a").click();
                expect(this.page.collection.attributes.fileType).toBe("");
                expect(this.page.collection.fetchAll).toHaveBeenCalled();
            })

            it("can filter the list by 'SQL'", function() {
                this.page.$("li[data-type=SQL] a").click();
                expect(this.page.collection.attributes.fileType).toBe("SQL");
                expect(this.page.collection.fetchAll).toHaveBeenCalled();
            })

            it("can filter the list by 'CODE'", function() {
                this.page.$("li[data-type=CODE] a").click();
                expect(this.page.collection.attributes.fileType).toBe("CODE");
                expect(this.page.collection.fetchAll).toHaveBeenCalled();
            })

            it("can filter the list by 'TEXT'", function() {
                this.page.$("li[data-type=TEXT] a").click();
                expect(this.page.collection.attributes.fileType).toBe("TEXT");
                expect(this.page.collection.fetchAll).toHaveBeenCalled();
            })

            it("can filter the list by 'OTHER'", function() {
                this.page.$("li[data-type=OTHER] a").click();
                expect(this.page.collection.attributes.fileType).toBe("OTHER");
                expect(this.page.collection.fetchAll).toHaveBeenCalled();
            });
        })

        describe("sorting", function() {
            beforeEach(function() {
                this.page.collection.order = undefined;
                spyOn(this.page.collection, "fetchAll");
            })

            it("has options for sorting", function() {
                expect(this.page.$("ul[data-event=sort] li[data-type=alpha]")).toExist();
                expect(this.page.$("ul[data-event=sort] li[data-type=date]")).toExist();
            })

            it("can sort the list alphabetically ascending", function() {
                this.page.$("li[data-type=alpha] a").click();
                expect(this.page.collection.order).toBe("fileName")
                expect(this.page.collection.fetchAll).toHaveBeenCalled();
            })

            it("can sort the list bu date ascending", function() {
                this.page.$("li[data-type=date] a").click();
                expect(this.page.collection.order).toBe("lastUpdatedStamp")
                expect(this.page.collection.fetchAll).toHaveBeenCalled();
            })
        })
    })

    describe("buttons", function() {
        context("before the workspace is fetched", function() {
            beforeEach(function() {
                this.page.render();
            })

            it("does not render any buttons", function() {
                expect(this.page.mainContent.contentDetails.$("button").length).toBe(0);
            })
        })

        context("after the workspace is fetched", function() {
            context("and the user can update the workspace", function() {
                beforeEach(function() {
                    spyOn(this.page.mainContent.model, 'canUpdate').andReturn(true);
                    this.server.completeFetchFor(this.workspace);
                    this.server.completeFetchFor(this.page.collection);
                })

                it("renders buttons", function() {
                    expect(this.page.mainContent.contentDetails.$("button[data-dialog=WorkfilesImport]")).toExist();
                    expect(this.page.mainContent.contentDetails.$("button[data-dialog=WorkfilesSqlNew]")).toExist();
                })

                it("shows the page title", function() {
                    expect(this.page.$('.content_header h1').text().trim()).toEqual(t("workfiles.title"));
                })
            })

            context("and the user cannot update the workspace", function() {
                beforeEach(function() {
                    spyOn(this.page.mainContent.model, 'canUpdate').andReturn(false);
                    this.server.completeFetchFor(this.workspace);
                    this.server.completeFetchFor(this.page.collection);
                });

                it("does not render buttons", function() {
                    expect(this.page.mainContent.contentDetails.$("button").length).toBe(0);
                });
            });

            context("and the workspace is archived", function() {
                beforeEach(function() {
                    this.workspace.set({archived_at: "2012-05-08 21:40:14"});
                    this.server.completeFetchFor(this.workspace);
                    this.server.completeFetchFor(this.page.collection);
                });

                it("does not render buttons", function() {
                    expect(this.page.mainContent.contentDetails.$("button").length).toBe(0);
                });
            });
        });
    });
});
