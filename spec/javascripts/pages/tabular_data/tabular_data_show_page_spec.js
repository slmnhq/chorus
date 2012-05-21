describe("chorus.pages.TabularDataShowPage", function() {
    beforeEach(function() {
        this.databaseObject = fixtures.databaseTable({
            instance: { id: "123", name: "bob_the_instance" },
            databaseName: "Foo/",
            schemaName: "Bar%",
            objectType: "TABLE",
            objectName: "slashes/"
        });
        this.databaseObject.get('workspaceUsed').workspaceList = [fixtures.nestedWorkspaceJson(), fixtures.nestedWorkspaceJson(), fixtures.nestedWorkspaceJson()];
        this.columnSet = this.databaseObject.columns({type: "meta"});

        this.page = new chorus.pages.TabularDataShowPage(
            "123",
            "Foo/",
            "Bar%",
            "TABLE",
            "slashes/"
        );
    });

    it("includes the InstanceCredentials mixin", function() {
        expect(this.page.requiredResourcesFetchForbidden).toBe(chorus.Mixins.InstanceCredentials.page.requiredResourcesFetchForbidden);
    });

    it("has a helpId", function() {
        expect(this.page.helpId).toBe("databaseObject")
    });

    it("has the right #failurePageOptions (for populating the content of a 404 page)", function() {
        var options = this.page.failurePageOptions();
        expect(options.title).toMatchTranslation("invalid_route.tabular_data.title");
        expect(options.text).toMatchTranslation("invalid_route.tabular_data.content");
    });

    it("fetches a database object", function() {
        expect(this.page.tabularData).toHaveBeenFetched();
    });

    describe("#initialize", function() {
        context("when the databaseObject fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.databaseObject);
            })

            it("fetches the columns as 'meta'", function() {
                expect(this.server.lastFetchAllFor(this.columnSet).params().type).toBe("meta");
            })

            describe("when the columnSet fetch completes", function() {
                context("with valid data", function() {

                    beforeEach(function() {
                        this.server.completeFetchAllFor(this.columnSet);
                    })

                    it("creates the sidebar", function() {
                        expect(this.page.sidebar).toBeDefined();
                        expect(this.page.sidebar.resource).toBe(this.page.tabularData);
                    })

                    it("does not set workspace", function() {
                        expect(this.page.sidebar.options.workspace).toBeFalsy();
                    })

                    it("sets the main content as persistent", function() {
                        expect(this.page.mainContent.persistent).toBeTruthy();
                    })
                })

                context("with errors", function() {
                    beforeEach(function() {
                        this.server.lastFetchAllFor(this.columnSet).failForbidden({message: "No permission"});
                    });

                    it("puts the errors on the new column set", function() {
                        expect(this.page.columnSet.serverErrors).toEqual({message: "No permission"});
                    })
                })
            })
        })
    });

    describe("#render", function() {
        beforeEach(function() {
            this.page.render();
        });

        it("shows a loading spinner until the fetches complete", function() {
            expect($(this.page.mainContent.el)).toHaveClass('loading_section');
        });


        context("when the fetches complete", function() {
            beforeEach(function() {
                spyOn(chorus, "search");
                this.qtipSpy = stubQtip();
                this.resizedSpy = spyOnEvent(this.page, 'resized');
                this.server.completeFetchFor(this.databaseObject);
                this.server.completeFetchAllFor(this.columnSet, [fixtures.databaseColumn(), fixtures.databaseColumn()]);
                this.server.completeFetchFor(this.databaseObject.statistics());
            });

            it("hides the loading spinner", function() {
                expect($(this.page.mainContent.el)).not.toHaveClass('loading_section');
            });

            context("when the model fails to load properly", function() {
                beforeEach(function() {
                    spyOn(Backbone.history, "loadUrl")
                    this.page.model.trigger('fetchNotFound', this.page.model);
                })

                it("navigates to the 404 page", function() {
                    expect(Backbone.history.loadUrl).toHaveBeenCalledWith("/invalidRoute");
                })
            });

            describe("workspace usage", function() {
                it("is in the custom header", function() {
                    expect(this.page.$('.content_header .found_in')).toExist();
                })

                it("qtip-ifies the other_menu", function() {
                    this.page.$('.content_header .found_in .open_other_menu').click()
                    expect(this.qtipSpy).toHaveVisibleQtip();
                    expect(this.qtipSpy.find('li').length).toBe(2);
                })

                context("when the tabular data is not used in any workspace", function() {
                    beforeEach(function() {
                        this.databaseObject.unset("workspaceUsed");
                    });

                    it("renders successfully, without the workspace usage section", function() {
                        this.page = new chorus.pages.TabularDataShowPage(
                            "123",
                            "Foo%2F",
                            "Bar%25",
                            "TABLE",
                            "slashes%2F"
                        );
                        this.server.completeFetchFor(this.databaseObject);
                        this.server.completeFetchAllFor(this.columnSet, [fixtures.databaseColumn(), fixtures.databaseColumn()]);
                        expect(this.page.$('.content_header .found_in')).not.toExist();
                    });
                });
            })

            it("has a search field in the content details that filters the column list", function() {
                var searchInput = this.page.mainContent.contentDetails.$("input.search"),
                    columnList = $(this.page.mainContent.content.el);

                expect(searchInput).toExist();
                expect(chorus.search).toHaveBeenCalled();
                var searchOptions = chorus.search.mostRecentCall.args[0];

                expect(searchOptions.input).toBe(searchInput);
                expect(searchOptions.list).toBe(columnList);
            });

            describe("breadcrumbs", function() {
                it("has the right breadcrumbs", function() {
                    expect(this.page.$("#breadcrumbs .breadcrumb a").eq(0).attr("href")).toBe("#/");
                    expect(this.page.$("#breadcrumbs .breadcrumb a").eq(0).text()).toBe(t("breadcrumbs.home"));

                    expect(this.page.$("#breadcrumbs .breadcrumb a").eq(1).attr("href")).toBe("#/instances");
                    expect(this.page.$("#breadcrumbs .breadcrumb a").eq(1).text()).toBe(t("breadcrumbs.instances"));

                    expect(this.page.$("#breadcrumbs .breadcrumb a").eq(2)).toHaveHref(this.databaseObject.instance().databases().showUrl());
                    expect(this.page.$("#breadcrumbs .breadcrumb a").eq(2)).toContainText(this.databaseObject.get("instance").name);

                    expect(this.page.$("#breadcrumbs .breadcrumb a").eq(3)).toHaveHref(this.databaseObject.database().showUrl());
                    expect(this.page.$("#breadcrumbs .breadcrumb a").eq(3)).toContainText(this.databaseObject.get("databaseName"));

                    expect(this.page.$("#breadcrumbs .breadcrumb a").eq(4).attr("href")).toBe(this.databaseObject.schema().showUrl());
                    expect(this.page.$("#breadcrumbs .breadcrumb a").eq(4)).toContainText(this.databaseObject.get('schemaName'))

                    expect(this.page.$("#breadcrumbs .breadcrumb .slug")).toContainText(this.databaseObject.get('objectName'));
                });
            });

            describe("#contentDetails", function() {
                it("does not have a Derive Chorus View button", function() {
                    expect(this.page.$(".derive")).not.toExist();
                });
            });
        });
    });
});
