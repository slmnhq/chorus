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

        this.datasetId = [
            this.workspace.get("sandboxInfo").instanceId,
            this.workspace.get("sandboxInfo").databaseName,
            this.workspace.get("sandboxInfo").schemaName,
            "BASE_TABLE",
            this.columnSet.attributes.tableName
        ].join("|");

        this.dataset = fixtures.datasetSandboxTable({"id": this.datasetId, workspace: { id: this.workspace.get("id") }})

        this.page = new chorus.pages.DatasetShowPage(this.workspace.get("id"), this.datasetId);
    })

    describe("#initialize", function() {
        it("fetches the workspace", function() {
            expect(this.server.lastFetchFor(this.workspace)).toBeDefined();
        });

        it("parses the datasetId", function() {
            expect(this.page.instanceId).toBe("5");
            expect(this.page.databaseName).toBe("db");
            expect(this.page.schemaName).toBe("schema");
            expect(this.page.objectType).toBe("BASE_TABLE");
            expect(this.page.objectName).toBe("table");
        });

        describe("when the workspace fetch completes", function() {
            beforeEach(function() {
                spyOn(chorus.collections.DatabaseColumnSet.prototype, "fetchAll").andCallThrough();
                this.server.completeFetchFor(this.workspace);
            })

            it("constructs a dataset with the right id", function() {
                expect(this.page.model).toBeA(chorus.models.Dataset);
                expect(this.page.model.get("id")).toBe(this.datasetId);
            });

            it("fetches the dataset", function() {
                expect(this.server.lastFetch().url).toBe("/edc/workspace/" + this.workspace.get("id") + "/dataset/" + this.datasetId);
            });

            describe("when the dataset fetch completes", function() {
                beforeEach(function() {
                    this.server.completeFetchFor(this.dataset);
                });

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
                        expect(this.page.sidebar.resource.get("id")).toBe(this.dataset.get("id"))
                    })

                    it("renders", function() {
                        expect(this.page.postRender).toHaveBeenCalled();
                    })
                })
            })
        })
    });

    describe("#render", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.workspace);
            this.resizedSpy = spyOnEvent(this.page, 'resized');
            this.server.completeFetchFor(this.dataset);
            this.server.completeFetchAllFor(this.columnSet, this.columnSet.models);
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
                expect(this.page.$("#breadcrumbs .breadcrumb a").eq(3).attr("href")).toBe(this.workspace.showUrl() + "/datasets");
                expect(this.page.$("#breadcrumbs .breadcrumb a").eq(3).text()).toBe(t("breadcrumbs.workspaces_data"));
            });

            it("displays the object name for the fifth crumb", function() {
                expect(this.page.$("#breadcrumbs .breadcrumb .slug").text()).toBe(this.columnSet.attributes.tableName);
            })
        });

        describe("#showSidebar", function() {
            beforeEach(function() {
                this.page.secondarySidebar = new Backbone.View();
                spyOn(this.page.secondarySidebar, "unbind");
                this.page.showSidebar("foo");
            });

            it("should unbind the column:removed event from the sidebar", function() {
                 expect(this.page.secondarySidebar.unbind).toHaveBeenCalledWith("column:removed", this.page.forwardDeselectedToMain);
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
                    expect(this.page.secondarySidebar).toBeA(chorus.views.DatasetVisualizationBoxplotSidebar)
                    expect(this.page.secondarySidebar.collection).toBe(this.page.columnSet);
                });
            });

            context("for a frequency chart", function() {
                beforeEach(function() {
                    this.page.mainContent.contentDetails.trigger("transform:sidebar", 'frequency');
                });

                it("should swap out the sidebar for the frequency sidebar", function() {
                    expect(this.page.secondarySidebar).toBeA(chorus.views.DatasetVisualizationFrequencySidebar)
                    expect(this.page.secondarySidebar.collection).toBe(this.page.columnSet);
                });
            });

            context("for a histogram chart", function() {
                beforeEach(function() {
                    this.page.mainContent.contentDetails.trigger("transform:sidebar", 'histogram');
                });

                it("should swap out the sidebar for the histogram sidebar", function() {
                    expect(this.page.secondarySidebar).toBeA(chorus.views.DatasetVisualizationHistogramSidebar)
                    expect(this.page.secondarySidebar.collection).toBe(this.page.columnSet);
                });
            });

            context("for a heatmap chart", function() {
                beforeEach(function() {
                    this.page.mainContent.contentDetails.trigger("transform:sidebar", 'heatmap');
                });

                it("should swap out the sidebar for the heatmap sidebar", function() {
                    expect(this.page.secondarySidebar).toBeA(chorus.views.DatasetVisualizationHeatmapSidebar)
                    expect(this.page.secondarySidebar.collection).toBe(this.page.columnSet);
                });
            });

            context("for a time series chart", function() {
                beforeEach(function() {
                    this.page.mainContent.contentDetails.trigger("transform:sidebar", 'timeseries');
                });

                it("should swap out the sidebar for the time series sidebar", function() {
                    expect(this.page.secondarySidebar).toBeA(chorus.views.DatasetVisualizationTimeSeriesSidebar)
                    expect(this.page.secondarySidebar.collection).toBe(this.page.columnSet);
                });
            });

            context("for a chorus view", function() {
                beforeEach(function() {
                    this.page.mainContent.contentDetails.trigger("transform:sidebar", 'chorus_view');
                });

                it("enables multi-select on the main content", function() {
                    expect(this.page.mainContent.content.selectMulti).toBeTruthy();
                });

                it("should swap out the sidebar for the chorus view sidebar", function() {
                    expect(this.page.secondarySidebar).toBeA(chorus.views.CreateChorusViewSidebar)
                });

                it("removes the current selection from the column list", function() {
                    expect(this.page.mainContent.content.$("li.selected").length).toBe(0);
                });

                describe("after cancelling", function() {
                    beforeEach(function() {
                        this.page.mainContent.content.selectAll();
                        this.page.mainContent.contentDetails.trigger("cancel:sidebar", "boxplot");
                    });

                    it("disables multi-select on the main content", function() {
                        expect(this.page.mainContent.content.selectMulti).toBeFalsy();
                    });

                    it("selects only the first item", function() {
                        expect(this.page.mainContent.content.$("li").length).toBe(2);
                        expect(this.page.mainContent.content.$("li:eq(0)")).toHaveClass("selected");
                        expect(this.page.mainContent.content.$("li:eq(1)")).not.toHaveClass("selected");
                    });
                });
                
                describe("clicking select all", function() {
                    beforeEach(function() {
                        this.selectSpy = jasmine.createSpy("column selected spy");
                        this.page.mainContent.content.bind("column:selected", this.selectSpy);
                        this.page.mainContent.contentDetails.$("a.select_all").click();
                    });

                    it("adds the selected class to each column li", function() {
                        expect(this.page.mainContent.content.$("li.selected").length).toBe(this.page.mainContent.content.$("li").length);
                    });

                    it("triggers column:selected once for each li", function() {
                        expect(this.selectSpy.callCount).toBe(this.page.mainContent.content.$("li.selected").length);
                    });

                    describe("clicking select none", function() {
                        beforeEach(function() {
                            this.deselectSpy = jasmine.createSpy("column deselected spy");
                            this.page.mainContent.content.bind("column:deselected", this.deselectSpy);
                            this.page.mainContent.contentDetails.$("a.select_none").click();
                        });

                        it("removes the selected class from each column li", function() {
                            expect(this.page.mainContent.content.$("li.selected").length).toBe(0);
                        });

                        it("triggers column:deselected once for each li", function() {
                            expect(this.deselectSpy.callCount).toBe(this.page.mainContent.content.$("li").length);
                        });
                    });
                });
                
                describe("when the column:selected event occurs", function() {
                    beforeEach(function() {
                        spyOnEvent(this.page.secondarySidebar, "column:selected");
                        this.column = fixtures.databaseColumn();
                        this.page.mainContent.content.trigger("column:selected", this.column);
                    });
                    
                    it("triggers that event on the chorus view sidebar", function (){
                        expect("column:selected").toHaveBeenTriggeredOn(this.page.secondarySidebar, [this.column]);
                    });
                });

                describe("when the column:deselected event occurs on the page", function() {
                    beforeEach(function() {
                        spyOnEvent(this.page.secondarySidebar, "column:deselected");
                        this.column = fixtures.databaseColumn();
                        this.page.mainContent.content.trigger("column:deselected", this.column);
                    })

                    it("triggers that event on the chorus view sidebar", function (){
                        expect("column:deselected").toHaveBeenTriggeredOn(this.page.secondarySidebar, [this.column]);
                    });
                });

                describe("when the column:removed event occurs on the sidebar", function() {
                    beforeEach(function() {
                        spyOnEvent(this.page.mainContent.content, "column:deselected");
                        this.column = fixtures.databaseColumn();
                        this.page.secondarySidebar.trigger("column:removed", this.column);
                    });

                    it("triggers the event on the main content", function() {
                        expect("column:deselected").toHaveBeenTriggeredOn(this.page.mainContent.content, [this.column]);
                    })
                })
            });

            describe("when the cancel:sidebar event is triggered", function() {
                beforeEach(function() {
                    this.page.mainContent.contentDetails.trigger("transform:sidebar", "boxplot");
                    expect(this.page.$('#sidebar .sidebar_content.secondary')).toHaveClass("dataset_visualization_boxplot_sidebar");
                    this.resizedSpy.reset();

                    this.page.mainContent.contentDetails.trigger("cancel:sidebar", "boxplot");
                });

                it("triggers 'resized' on the page", function() {
                    expect('resized').toHaveBeenTriggeredOn(this.page);
                });

                it("restores the original sidebar while hiding the secondarySidebar", function() {
                    expect(this.page.$('#sidebar .sidebar_content.primary')).not.toHaveClass('hidden');
                    expect(this.page.$('#sidebar .sidebar_content.secondary')).toHaveClass('hidden');
                });

                it("removes all classes added when transform:sidebar is triggered", function() {
                    expect(this.page.$('#sidebar .sidebar_content.secondary')).not.toHaveClass("dataset_visualization_boxplot_sidebar");
                })
            });
        });
    })
});
