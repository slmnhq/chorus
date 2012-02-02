describe("chorus.pages.DatasetShowPage", function() {
    beforeEach(function() {
        this.workspace = fixtures.workspace({
            "sandboxInfo": {
                databaseId: "4",
                databaseName: "db",
                instanceId: "5",
                instanceName: "instance",
                schemaId: "6",
                schemaName: "schema",
                sandboxId: "99"
            }
        });
        this.columnSet = fixtures.databaseColumnSet([], {
            instanceId: this.workspace.get("sandboxInfo").instanceId,
            databaseName: this.workspace.get("sandboxInfo").databaseName,
            schemaName: this.workspace.get("sandboxInfo").schemaName,
            tableName: "table"
        });
        this.page = new chorus.pages.DatasetShowPage(this.workspace.get("id"), "SANDBOX_TABLE", "BASE_TABLE", this.columnSet.attributes.tableName);
    })

    describe("#initialize", function() {
        it("fetches the workspace", function() {
            expect(this.server.lastFetchFor(this.workspace)).toBeDefined();
        });

        describe("when the workspace fetch completes", function() {
            beforeEach(function() {
                spyOn(chorus.collections.DatabaseColumnSet.prototype, "fetchAll").andCallThrough();
                this.server.completeFetchFor(this.workspace);
            })

            it("fetches all of the columns", function() {
                expect(chorus.collections.DatabaseColumnSet.prototype.fetchAll).toHaveBeenCalled();
            })

            describe("when the columnSet fetch completes", function() {
                beforeEach(function() {
                    spyOn(this.page, "postRender");
                    this.server.lastFetch().succeed(this.columnSet.attributes, { page: "1", total: "1" })
                })

                it("creates the sidebar", function() {
                    expect(this.page.sidebar).toBeDefined();
                    expect(this.page.sidebar.resource.get("instance").id).toBe("5");
                    expect(this.page.sidebar.resource.get("databaseName")).toBe("db");
                    expect(this.page.sidebar.resource.get("schemaName")).toBe("schema");
                    expect(this.page.sidebar.resource.get("objectName")).toBe("table");
                    expect(this.page.sidebar.resource.get("objectType")).toBe("BASE_TABLE");
                    expect(this.page.sidebar.resource.get("type")).toBe("SANDBOX_TABLE");
                })

                it("renders", function() {
                    expect(this.page.postRender).toHaveBeenCalled();
                })

                it("creates a model with the required attributes", function() {
                    expect(this.page.model).toBeDefined();
                    expect(this.page.model.get("workspace").id).toBe("2");
                    expect(this.page.model.get("instance").id).toBe("5");
                    expect(this.page.model.get("sandboxId")).toBe("99");
                });
            })
        })
    });

    describe("#render", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.workspace);
            this.server.lastFetch().succeed(this.columnSet.attributes, { page: "1", total: "1" })
        })

        describe("breadcrumbs", function() {
            it("links to home for the first crumb", function() {
                expect(this.page.$("#breadcrumbs .breadcrumb a").eq(0).attr("href")).toBe("#/");
                expect(this.page.$("#breadcrumbs .breadcrumb a").eq(0).text()).toBe(t("breadcrumbs.home"));
            });

            it("links to /workspaces for the second crumb", function() {
                expect(this.page.$("#breadcrumbs .breadcrumb a").eq(1).attr("href")).toBe("#/workspaces");
                expect(this.page.$("#breadcrumbs .breadcrumb a").eq(1).text()).toBe(t("breadcrumbs.workspaces"));
            });

            it("links to workspace show for the third crumb", function() {
                expect(this.page.$("#breadcrumbs .breadcrumb a").eq(2).attr("href")).toBe(this.workspace.showUrl());
                expect(this.page.$("#breadcrumbs .breadcrumb a").eq(2).text()).toBe(this.workspace.displayShortName());
            });

            it("links to the workspace data tab for the fourth crumb", function() {
                expect(this.page.$("#breadcrumbs .breadcrumb a").eq(3).attr("href")).toBe(this.workspace.showUrl() + "/data");
                expect(this.page.$("#breadcrumbs .breadcrumb a").eq(3).text()).toBe(t("breadcrumbs.workspaces_data"));
            });

            it("displays the object name for the fifth crumb", function() {
                expect(this.page.$("#breadcrumbs .breadcrumb .slug").text()).toBe(this.columnSet.attributes.tableName);
            })
        });

        describe("when the 'transform:visualize' event is triggered", function() {
            beforeEach(function() {
                this.page.render()
                spyOn(this.page, 'render');
            });

            it("should not re-render the page", function() {
                this.page.mainContent.contentDetails.trigger("transform:visualize", 'boxplot');
                expect(this.page.render).not.toHaveBeenCalled();
            });

            it("should re-render the sidebar subview", function() {
                this.page.mainContent.contentDetails.trigger("transform:visualize", 'boxplot');
                expect(this.page.$('#sidebar .sidebar_content').get(0)).toBe(this.page.sidebar.el);
            });

            context("for a boxplot", function() {
                beforeEach(function() {
                    this.page.mainContent.contentDetails.trigger("transform:visualize", 'boxplot');
                });

                it("should swaps out the sidebar for the boxplot sidebar", function() {
                    expect(this.page.sidebar).toBeA(chorus.views.DatasetVisualizationBoxplotSidebar)
                    expect(this.page.sidebar.collection).toBe(this.page.columnSet);
                });
            });

            context("for a frequency chart", function() {
                beforeEach(function() {
                    this.page.mainContent.contentDetails.trigger("transform:visualize", 'frequency');
                });

                it("should swaps out the sidebar for the frequency sidebar", function() {
                    expect(this.page.sidebar).toBeA(chorus.views.DatasetVisualizationFrequencySidebar)
                    expect(this.page.sidebar.collection).toBe(this.page.columnSet);
                });
            });

            context("for a histogram chart", function() {
                beforeEach(function() {
                    this.page.mainContent.contentDetails.trigger("transform:visualize", 'histogram');
                });

                it("should swaps out the sidebar for the histogram sidebar", function() {
                    expect(this.page.sidebar).toBeA(chorus.views.DatasetVisualizationHistogramSidebar)
                    expect(this.page.sidebar.collection).toBe(this.page.columnSet);
                });
            });

        });
    })
});
