describe("chorus.pages.TabularDataShowPage", function() {
    beforeEach(function() {
        this.databaseObject = fixtures.databaseTable();
        this.databaseObject.get('workspaceUsed').workspaceList = [fixtures.nestedWorkspaceJson(), fixtures.nestedWorkspaceJson(), fixtures.nestedWorkspaceJson()];
        this.columnSet = this.databaseObject.columns({type: "meta"});

        var a = this.databaseObject.attributes

        this.page = new chorus.pages.TabularDataShowPage(a.instance.id, a.databaseName, a.schemaName, a.objectType, a.objectName);
    });

    it("includes the InstanceCredentials mixin", function() {
        expect(this.page.requiredResourcesFetchFailed).toBe(chorus.Mixins.InstanceCredentials.page.requiredResourcesFetchFailed);
    });

    it("has a helpId", function() {
        expect(this.page.helpId).toBe("databaseObject")
    });

    it("has the right #failurePageOptions (for populating the content of a 404 page)", function() {
        var options = this.page.failurePageOptions();
        expect(options.title).toMatchTranslation("invalid_route.tabular_data.title");
        expect(options.text).toMatchTranslation("invalid_route.tabular_data.content");
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
                        this.server.lastFetchAllFor(this.columnSet).fail([{message: "No permission"}]);
                    });

                    it("puts the errors on the new column set", function() {
                        expect(this.page.columnSet.serverErrors[0].message).toBe("No permission");
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
                    this.page.model.trigger('fetchFailed', this.page.model);
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
                        var a = this.databaseObject.attributes;
                        this.page = new chorus.pages.TabularDataShowPage(a.instance.id, a.databaseName, a.schemaName, a.objectType, a.objectName);
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

                    expect(this.page.$("#breadcrumbs .breadcrumb a").eq(2)).toHaveHref("#/instances/" + this.databaseObject.get("instance").id + "/databases");
                    expect(this.page.$("#breadcrumbs .breadcrumb a").eq(2)).toContainText(this.databaseObject.get("instance").name);

                    expect(this.page.$("#breadcrumbs .breadcrumb a").eq(3)).toHaveHref("#/instances/" + this.databaseObject.get("instance").id + "/databases/" + this.databaseObject.get("databaseName"));
                    expect(this.page.$("#breadcrumbs .breadcrumb a").eq(3)).toContainText(this.databaseObject.get("databaseName"));

                    expect(this.page.$("#breadcrumbs .breadcrumb a").eq(4).attr("href")).toBe("#/instances/" + this.databaseObject.get("instance").id + "/databases/" + this.databaseObject.get('databaseName') + "/schemas/" + this.databaseObject.get("schemaName"));
                    expect(this.page.$("#breadcrumbs .breadcrumb a").eq(4)).toContainText(this.databaseObject.get('schemaName'))

                    expect(this.page.$("#breadcrumbs .breadcrumb .slug")).toContainText(this.databaseObject.get('objectName'));
                });
            });

            describe("#contentDetails", function() {
                it("does not have a Derive Chorus View button", function() {
                    expect(this.page.$(".derive")).not.toExist();
                })
            })

            describe("#showSidebar", function() {
                beforeEach(function() {
                    this.page.secondarySidebar = new chorus.views.Base();
                    this.originalSidebar = this.page.secondarySidebar;
                    spyOn(this.originalSidebar, "cleanup");
                    this.page.showSidebar("foo");
                });

                it("calls cleanup on the old sidebar", function() {
                    expect(this.originalSidebar.cleanup).toHaveBeenCalledWith();
                });
            });

            describe("when the transform:sidebar event is triggered", function() {
                beforeEach(function() {
                    this.page.render()
                    spyOn(this.page, 'render');
                });

                context("for any valid type of plot", function() {
                    beforeEach(function() {
                        this.page.mainContent.contentDetails.trigger("transform:sidebar", "boxplot");
                    });

                    it("triggers 'resized' on the page", function() {
                        expect('resized').toHaveBeenTriggeredOn(this.page);
                    });

                    it("should not re-render the page", function() {
                        expect(this.page.render).not.toHaveBeenCalled();
                    });

                    it("should hide the original sidebar and shows the viz_sidebar", function() {
                        expect(this.page.$('#sidebar .sidebar_content.primary')).toHaveClass('hidden');
                        expect(this.page.$('#sidebar .sidebar_content.secondary')).not.toHaveClass('hidden');
                    });

                    it("should re-render the sidebar subview", function() {
                        expect(this.page.$('#sidebar .sidebar_content').get(1)).toBe(this.page.secondarySidebar.el);
                    });
                })

                context("for a boxplot", function() {
                    beforeEach(function() {
                        this.page.mainContent.contentDetails.trigger("transform:sidebar", 'boxplot');
                    });

                    it("should swap out the sidebar for the boxplot sidebar", function() {
                        expect(this.page.secondarySidebar).toBeA(chorus.views.TabularDataVisualizationBoxplotSidebar)
                        expect(this.page.secondarySidebar.collection).toBe(this.page.columnSet);
                    });
                });

                context("for a frequency chart", function() {
                    beforeEach(function() {
                        this.page.mainContent.contentDetails.trigger("transform:sidebar", 'frequency');
                    });

                    it("should swap out the sidebar for the frequency sidebar", function() {
                        expect(this.page.secondarySidebar).toBeA(chorus.views.TabularDataVisualizationFrequencySidebar)
                        expect(this.page.secondarySidebar.collection).toBe(this.page.columnSet);
                    });
                });

                context("for a histogram chart", function() {
                    beforeEach(function() {
                        this.page.mainContent.contentDetails.trigger("transform:sidebar", 'histogram');
                    });

                    it("should swap out the sidebar for the histogram sidebar", function() {
                        expect(this.page.secondarySidebar).toBeA(chorus.views.TabularDataVisualizationHistogramSidebar)
                        expect(this.page.secondarySidebar.collection).toBe(this.page.columnSet);
                    });
                });

                context("for a heatmap chart", function() {
                    beforeEach(function() {
                        this.page.mainContent.contentDetails.trigger("transform:sidebar", 'heatmap');
                    });

                    it("should swap out the sidebar for the heatmap sidebar", function() {
                        expect(this.page.secondarySidebar).toBeA(chorus.views.TabularDataVisualizationHeatmapSidebar)
                        expect(this.page.secondarySidebar.collection).toBe(this.page.columnSet);
                    });
                });

                context("for a time series chart", function() {
                    beforeEach(function() {
                        this.page.mainContent.contentDetails.trigger("transform:sidebar", 'timeseries');
                    });

                    it("should swap out the sidebar for the time series sidebar", function() {
                        expect(this.page.secondarySidebar).toBeA(chorus.views.TabularDataVisualizationTimeSeriesSidebar)
                        expect(this.page.secondarySidebar.collection).toBe(this.page.columnSet);
                    });
                });

                describe("when the cancel:sidebar event is triggered", function() {
                    beforeEach(function() {
                        this.page.mainContent.contentDetails.trigger("transform:sidebar", "boxplot");
                        expect(this.page.$('#sidebar .sidebar_content.secondary')).toHaveClass("tabular_data_visualization_boxplot_sidebar");
                        this.resizedSpy.reset();

                        chorus.PageEvents.broadcast('cancel:sidebar', 'boxplot');
                    });

                    it("triggers 'resized' on the page", function() {
                        expect('resized').toHaveBeenTriggeredOn(this.page);
                    });

                    it("restores the original sidebar while hiding the secondarySidebar", function() {
                        expect(this.page.$('#sidebar .sidebar_content.primary')).not.toHaveClass('hidden');
                        expect(this.page.$('#sidebar .sidebar_content.secondary')).toHaveClass('hidden');
                    });

                    it("removes all classes added when transform:sidebar is triggered", function() {
                        expect(this.page.$('#sidebar .sidebar_content.secondary')).not.toHaveClass("tabular_data_visualization_boxplot_sidebar");
                    })
                });

                describe("when the cancel:sidebar event is triggered, without a sidebar (unclear whether this is a possible state of the app)", function() {
                    it("does not throw exceptions", function() {
                        expect(function() {
                            chorus.PageEvents.broadcast('cancel:sidebar', 'boxplot');
                        }).not.toThrow();
                    });
                });
            });
        });
    });
});
