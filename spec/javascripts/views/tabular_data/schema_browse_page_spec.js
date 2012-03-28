describe("chorus.pages.SchemaBrowsePage", function() {
    beforeEach(function() {
        spyOn(_, "debounce").andCallThrough();
        this.schema = fixtures.schema();
        this.instance = fixtures.instance({id: this.schema.get("instanceId")});
        this.database = fixtures.database({name: this.schema.get("databaseName"), instanceId: this.instance.get("id")});
        this.page = new chorus.pages.SchemaBrowsePage(this.schema.get("instanceId"), this.schema.get("databaseName"), this.schema.get("name"));
    })

    it("has a helpId", function() {
        expect(this.page.helpId).toBe("schema")
    })

    it("includes the InstanceCredentials mixin", function() {
        expect(this.page.requiredResourcesFetchFailed).toBe(chorus.Mixins.InstanceCredentials.page.requiredResourcesFetchFailed);
    });

    describe("when a fetch fails", function() {
        beforeEach(function() {
            spyOn(Backbone.history, "loadUrl")
        })

        it("navigates to the 404 page when the instance fetch fails", function() {
            this.page.instance.trigger('fetchFailed', this.page.instance);
            expect(Backbone.history.loadUrl).toHaveBeenCalledWith("/invalidRoute")
        })

        it("navigates to the 404 page when the collection fetch fails", function() {
            this.page.collection.trigger('fetchFailed', this.page.collection);
            expect(Backbone.history.loadUrl).toHaveBeenCalledWith("/invalidRoute")
        })
    });

    context("when only the instance has been fetched", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.instance);
        });

        it("renders the schema's canonical name", function() {
            expect($(this.page.el)).toContainText(this.page.schema.canonicalName());
        });

        it("displays a loading section", function() {
            expect(this.page.$(".loading_section")).toExist();
        });
    });

    context("after everything has been fetched", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.instance);
            this.server.completeFetchFor(this.page.collection, [
                fixtures.databaseTable(),
                fixtures.databaseView()
            ]);
        });

        it("displays the search input", function() {
            expect(this.page.$("input.search").attr("placeholder")).toMatchTranslation("schema.search");
        });

        it("sets the instanceName on the schema", function() {
            expect(this.page.schema.get("instanceName")).toBe(this.instance.get("name"));
        });

        it("pre-selects the first item", function() {
            expect(this.page.$(".dataset_list li").eq(0)).toHaveClass("selected");
        });

        it("changes the selection after clicking another item", function() {
            this.page.$(".dataset_list li").eq(1).click();

            expect(this.page.$(".dataset_list li").eq(0)).not.toHaveClass("selected");
            expect(this.page.$(".dataset_list li").eq(1)).toHaveClass("selected");
        });

        it("has the right breadcrumbs", function() {
            expect(this.page.$("#breadcrumbs .breadcrumb a").eq(0)).toHaveHref("#/");
            expect(this.page.$("#breadcrumbs .breadcrumb a").eq(0)).toContainTranslation("breadcrumbs.home");

            expect(this.page.$("#breadcrumbs .breadcrumb a").eq(1)).toHaveHref("#/instances");
            expect(this.page.$("#breadcrumbs .breadcrumb a").eq(1)).toContainTranslation("breadcrumbs.instances");

            expect(this.page.$("#breadcrumbs .breadcrumb a").eq(2)).toContainText(this.instance.get("name"));
            expect(this.page.$("#breadcrumbs .breadcrumb a").eq(2)).toHaveHref(this.instance.showUrl());

            expect(this.page.$("#breadcrumbs .breadcrumb a").eq(3)).toContainText(this.database.get("name"));
            expect(this.page.$("#breadcrumbs .breadcrumb a").eq(3)).toHaveHref(this.database.showUrl());

            expect(this.page.$("#breadcrumbs .breadcrumb .slug").text()).toBe(this.page.schema.get("name"));
        });

        it("has the right title", function() {
            expect(this.page.$(".content_header h1").text()).toBe(this.page.schema.canonicalName());
        });

        it("constructs the main content list correctly", function() {
            expect(this.page.mainContent).toBeA(chorus.views.MainContentList);
            expect(this.page.mainContent.collection).toBe(this.page.collection);
            expect(this.page.mainContent.collection).toBeA(chorus.collections.DatabaseObjectSet);

            expect(this.page.$(this.page.mainContent.el).length).toBe(1);
        });

        it("creates the collection with the right options", function() {
            expect(this.page.collection.attributes.instanceId).toBe(this.schema.get("instanceId"))
            expect(this.page.collection.attributes.databaseName).toBe(this.schema.get("databaseName"))
            expect(this.page.collection.attributes.schemaName).toBe(this.schema.get("name"))
        })

        describe("search", function() {
            beforeEach(function() {
                this.page.$("input.search").val("foo").trigger("keyup");
            });

            it("throttles the number of search requests", function() {
                expect(_.debounce).toHaveBeenCalled();
            });

            it("shows the Loading text in the count span", function() {
                expect($(this.page.$(".count"))).toContainTranslation("loading");
            });

            it("re-fetches the collection with the search parameters", function() {
                expect(this.server.lastFetch().url).toContainQueryParams({filter: "foo"});
            });

            context("when the fetch completes", function() {
                beforeEach(function() {
                    spyOn(this.page.mainContent, "render").andCallThrough();
                    spyOn(this.page.mainContent.content, "render").andCallThrough();
                    spyOn(this.page.mainContent.contentFooter, "render").andCallThrough();
                    spyOn(this.page.mainContent.contentDetails, "render").andCallThrough();
                    spyOn(this.page.mainContent.contentDetails, "updatePagination").andCallThrough();
                    this.server.completeFetchFor(this.page.collection);
                });

                it("updates the header, footer, and body", function() {
                    expect(this.page.mainContent.content.render).toHaveBeenCalled();
                    expect(this.page.mainContent.contentFooter.render).toHaveBeenCalled();
                    expect(this.page.mainContent.contentDetails.updatePagination).toHaveBeenCalled();
                });

                it("does not re-render the page or body", function() {
                    expect(this.page.mainContent.render).not.toHaveBeenCalled();
                    expect(this.page.mainContent.contentDetails.render).not.toHaveBeenCalled();
                });

                it("shows the Loading text in the count span", function() {
                    expect($(this.page.$(".count"))).not.toContainTranslation("loading");
                });
            });
        });
    });
});
