describe("chorus.pages.DatasetShowPage", function() {
    beforeEach(function() {
        this.workspace = newFixtures.workspace({
            id: '100',
            "sandboxInfo": {
                databaseId: "4",
                databaseName: "db",
                instance_id: "5",
                instanceName: "instance",
                schemaId: "6",
                schemaName: "schema",
                sandboxId: "99"
            }
        });
        chorus.page = {workspace: this.workspace};

        var sanboxInfo = this.workspace.get("sandboxInfo")

        this.dataset = newFixtures.dataset.sourceTable({
            id: this.datasetId,
            instance: { id: sanboxInfo.instance_id, name: sanboxInfo.instanceName},
            databaseName: sanboxInfo.databaseName,
            schemaName: sanboxInfo.schemaName,
            importFrequency: null,
            objectName: 'tableName',
            workspace: { id: this.workspace.get("id") }
        })

        this.columnSet = this.dataset.columns({type: "meta"});

        this.datasetId = this.dataset.get('id');

        this.page = new chorus.pages.DatasetShowPage(this.workspace.get("id"), this.datasetId);
        spyOn(this.page, "drawColumns").andCallThrough();
    })

    it("has a helpId", function() {
        expect(this.page.helpId).toBe("dataset")
    })

    describe("#initialize", function() {
        it("sets the workspace id, for prioritizing search", function() {
            expect(this.page.workspaceId).toBe('100');
        });

        it("sets requiredResources in the sidebar", function() {
            expect(this.page.sidebarOptions.requiredResources[0].id).toBe(this.page.workspace.id)
        });

        it("sets the workspace to pass into contentDetails", function() {
           expect(this.page.contentDetailsOptions.workspace).toBe(this.page.workspace);
        });

        it("marks the workspace as a required resource", function() {
            expect(this.page.requiredResources.find(function(resource) {
                return resource instanceof chorus.models.Workspace && resource.get("id") == '100'
            }, this)).toBeTruthy();
        });


        context("when the workspace fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.workspace);
            })

            it("constructs a dataset with the right id", function() {
                expect(this.page.model).toBeA(chorus.models.Dataset);
                expect(this.page.model.get("id")).toBe(this.datasetId);
            });

            context("when the dataset fetch completes", function() {
                beforeEach(function() {
                    this.server.completeFetchFor(this.dataset);
                });

                describe("when the columnSet fetch completes", function() {
                    beforeEach(function() {
                        this.server.lastFetchAllFor(this.columnSet).succeed([
                            fixtures.databaseColumn(),
                            fixtures.databaseColumn()
                        ]);
                    })

                    it("creates a new columnSet with the same data as the dataset's columnSet", function() {
                        expect(this.page.columnSet.models).toEqual(this.page.tabularData.columns().models);
                        expect(this.page.columnSet).not.toEqual(this.page.tabularData.columns());
                    });

                    it("does not modify the tabularData reference the existing columns have", function() {
                        expect(this.page.columnSet.models[0].tabularData).toBe(this.page.tabularData);
                    });

                    it("sets the sidebar's workspace", function() {
                        expect(this.page.sidebar.options.workspace.id).toBe(this.workspace.id);
                    });

                    it("sets the contentDetail's workspace", function() {
                        expect(this.page.mainContent.contentDetails.options.workspace.id).toBe(this.workspace.id);
                    });

                    describe("when editing a chorus view", function() {
                        beforeEach(function() {
                            this.oldHeader = this.page.mainContent.contentHeader;
                            spyOn(this.page, 'render');
                            this.page.mainContent.contentDetails.trigger("dataset:edit");
                        });

                        it("sets the main content to DatasetEditChorusView", function() {
                            expect(this.page.mainContent.content).toBeA(chorus.views.DatasetEditChorusView);
                        });

                        it("keeps the header", function() {
                            expect(this.page.mainContent.contentHeader).toBe(this.oldHeader);
                        });

                        it("should not re-render", function() {
                            expect(this.page.render).not.toHaveBeenCalled();
                        });

                        describe("when user cancel edit dataset and dataset:cancelEdit is triggered", function() {
                            beforeEach(function() {
                                this.page.drawColumns.reset();
                                chorus.PageEvents.broadcast("dataset:cancelEdit");
                            });

                            it("re-draws the page", function() {
                                expect(this.page.drawColumns).toHaveBeenCalled();
                            })
                        })
                    });
                })
            })
        });

    });

    describe("#render", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.workspace);
            this.resizedSpy = spyOnEvent(this.page, 'resized');
            this.server.completeFetchFor(this.dataset);
            this.server.completeFetchAllFor(this.columnSet, [fixtures.databaseColumn(), fixtures.databaseColumn()]);
            this.server.completeFetchFor(this.dataset.statistics());
        })

        describe("sidebar", function() {
            it("sets workspace", function() {
                expect(this.page.sidebar.options.workspace).toBeTruthy();
            })
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

        describe("#contentDetails", function() {
            it("has a Derive Chorus View button", function() {
                expect(this.page.$(".derive")).toExist();
            })
        })

        describe("when the transform:sidebar event is triggered", function() {
            beforeEach(function() {
                this.page.render()
                spyOn(this.page, 'render');
            });

            context("for a chorus view", function() {
                beforeEach(function() {
                    this.page.secondarySidebar = new chorus.views.Base();
                    this.originalSidebar = this.page.secondarySidebar;
                    spyOn(this.originalSidebar, "cleanup");
                    spyOn(this.page.mainContent.content, 'render').andCallThrough();
                    this.page.mainContent.contentDetails.trigger("transform:sidebar", 'chorus_view');
                });


                it("calls cleanup on the old sidebar", function() {
                    expect(this.originalSidebar.cleanup).toHaveBeenCalled();
                });

                it("disables the sidebar", function() {
                    expect(this.page.sidebar.disabled).toBeTruthy();
                })

                it("sets the datasetNumber to 1", function() {
                    expect(this.page.tabularData.datasetNumber).toBe(1);
                });

                it("enables multi-select on the main content", function() {
                    expect(this.page.mainContent.content.selectMulti).toBeTruthy();
                });

                it("enables showDatasetName on the main content", function() {
                    expect(this.page.mainContent.content.showDatasetName).toBeTruthy();
                    expect(this.page.mainContent.content.render).toHaveBeenCalled();
                });

                it("should swap out the sidebar for the chorus view sidebar", function() {
                    expect(this.page.secondarySidebar).toBeA(chorus.views.CreateChorusViewSidebar)
                });

                it("removes the current selection from the column list", function() {
                    expect(this.page.mainContent.content.$("li.selected").length).toBe(0);
                });

                it("passes down the columnSet to the sidebar", function() {
                    expect(this.page.secondarySidebar.options.aggregateColumnSet).toBe(this.page.columnSet);
                });

                describe("after cancelling", function() {
                    beforeEach(function() {
                        this.page.mainContent.content.render.reset();
                        this.page.mainContent.content.selectAll();
                        var otherColumn = fixtures.databaseColumn();
                        otherColumn.tabularData = this.page.model;
                        this.page.columnSet.add(otherColumn);
                        chorus.PageEvents.broadcast('cancel:sidebar', 'chorus_view');
                    });

                    it("calls cleanup on the old sidebar", function() {
                        expect(this.originalSidebar.cleanup).toHaveBeenCalled();
                    });

                    it("enables the sidebar", function() {
                        expect(this.page.sidebar.disabled).toBeFalsy();
                    });

                    it("clears the datasetNumber", function() {
                        expect(this.page.tabularData.datasetNumber).toBeUndefined();
                    });

                    it("restores the columnSet to the base set of columns from the dataset", function() {
                        expect(this.page.columnSet.models).toEqual(this.page.tabularData.columns().models);
                    });

                    it("disables multi-select on the main content", function() {
                        expect(this.page.mainContent.content.selectMulti).toBeFalsy();
                    });

                    it("disables showDatasetName on the main content", function() {
                        expect(this.page.mainContent.content.showDatasetName).toBeFalsy();
                        expect(this.page.mainContent.content.render).toHaveBeenCalled();
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
                        chorus.PageEvents.subscribe("column:selected", this.selectSpy);
                        this.page.mainContent.contentDetails.$("a.select_all").click();
                    });

                    it("adds the selected class to each column li", function() {
                        expect(this.page.mainContent.content.$("li.selected").length).toBe(this.page.mainContent.content.$("li").length);
                    });

                    it("broadcasts the column:selected page event once for each li", function() {
                        expect(this.selectSpy.callCount).toBe(this.page.mainContent.content.$("li.selected").length);
                    });

                    describe("clicking select none", function() {
                        beforeEach(function() {
                            this.deselectSpy = jasmine.createSpy("column deselected spy");
                            chorus.PageEvents.subscribe("column:deselected", this.deselectSpy);
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
            });

            context("for an edit chorus view", function() {
                beforeEach(function() {
                    this.page.mainContent.contentDetails.trigger("transform:sidebar", 'edit_chorus_view');
                });

                it("swaps out the sidebar for the dataset edit chorus view sidebar", function() {
                    expect(this.page.secondarySidebar).toBeA(chorus.views.DatasetEditChorusViewSidebar)
                });
            });

            describe("when the cancel:sidebar event is triggered", function() {
                beforeEach(function() {
                    this.page.mainContent.contentDetails.trigger("transform:sidebar", "edit_chorus_view");
                    expect(this.page.$('#sidebar .sidebar_content.secondary')).toHaveClass("dataset_edit_chorus_view_sidebar");
                    this.resizedSpy.reset();

                    chorus.PageEvents.broadcast('cancel:sidebar', 'edit_chorus_view');
                });

                it("triggers 'resized' on the page", function() {
                    expect('resized').toHaveBeenTriggeredOn(this.page);
                });

                it("restores the original sidebar while hiding the secondarySidebar", function() {
                    expect(this.page.$('#sidebar .sidebar_content.primary')).not.toHaveClass('hidden');
                    expect(this.page.$('#sidebar .sidebar_content.secondary')).toHaveClass('hidden');
                });

                it("removes all classes added when transform:sidebar is triggered", function() {
                    expect(this.page.$('#sidebar .sidebar_content.secondary')).not.toHaveClass("chart_configuration");
                })
            });
        });

        describe("#contentHeader", function() {
            describe("the links at the top", function() {
                it("includes the link to the instance", function() {
                    expect(this.page.$(".content_header a.instance")).toHaveHref(this.page.model.instance().showUrl());
                    expect(this.page.$(".content_header a.instance")).toHaveText(this.page.model.instance().name());
                });

                it("includes the link to the database", function() {
                    expect(this.page.$(".content_header a.database")).toHaveHref(this.page.model.database().showUrl());
                    expect(this.page.$(".content_header a.database")).toHaveText(this.page.model.database().name());
                });

                it("includes the link to the schema", function() {
                    expect(this.page.$(".content_header a.schema")).toHaveHref(this.page.model.schema().showUrl());
                    expect(this.page.$(".content_header a.schema")).toHaveText(this.page.model.schema().name());
                });
            });

            context("when the dataset has an import schedule", function() {
                beforeEach(function() {
                    this.server.completeFetchFor(this.page.tabularData.getImport(), fixtures.datasetImport());
                    expect(this.page.tabularData.getImport().get('scheduleInfo').frequency).toBe("WEEKLY");
                    this.page.render();
                });

                it("shows the icon for import frequency", function() {
                    expect(this.page.$(".tag.import_frequency")).toContainText("Weekly")
                });

                it("sets a has_import class on the content_header", function() {
                    expect(this.page.$(".content_header .has_import")).toExist();
                })
            });

            context("when the dataset does not have an import schedule", function() {
                beforeEach(function() {
                    this.server.completeFetchFor(this.page.tabularData.getImport(), []);
                    this.page.render();
                });

                it("does not show the icon for import frequency", function() {
                    expect(this.page.$(".tag.import_frequency")).not.toExist();
                });

                it("does not set a has_import class on the content_header", function() {
                    expect(this.page.$(".content_header.has_import")).not.toExist();
                })
            });
        });
    })

});
