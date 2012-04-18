describe("chorus.views.TabularDataContentDetails", function() {
    describe("#render", function() {
        beforeEach(function() {
            this.$columnList = $("<ul/>");
            this.qtipMenu = stubQtip();
            this.tabularData = newFixtures.dataset.sourceTable();
            this.collection = this.tabularData.columns([fixtures.databaseColumn(), fixtures.databaseColumn()]);

            this.view = new chorus.views.TabularDataContentDetails({
                tabularData: this.tabularData,
                collection: this.collection,
                $columnList: this.$columnList
            });
            spyOn(this.view.filterWizardView, 'resetFilters').andCallThrough();
            spyOn(chorus, "search");
            this.server.completeFetchFor(this.tabularData.statistics(), fixtures.datasetStatisticsView());
            this.view.render();
            $("#jasmine_content").append(this.view.el);
        });

        it("puts the dataset filter subview in the filters div", function() {
            expect($(this.view.el).find(this.view.filterWizardView.el)).toBeTruthy();
        });

        it("renders the title", function() {
            expect(this.view.$(".data_preview h1").text().trim()).toMatchTranslation("dataset.data_preview")
        });

        it("renders the 'Preview Data' button", function() {
            expect(this.view.$(".column_count .preview").text().trim()).toMatchTranslation("dataset.data_preview");
        })

        it("hides the filters div", function() {
            expect(this.view.$(".filters")).toHaveClass("hidden");
        });

        it("hides the edit chorus view info bar", function() {
            expect(this.view.$(".edit_chorus_view_info")).toHaveClass("hidden");
        });

        it("has a search field in the content details that filters the column list", function() {
            var searchInput = this.view.$("input.search:visible");

            expect(searchInput).toExist();
            expect(chorus.search).toHaveBeenCalled();
            var searchOptions = chorus.search.mostRecentCall.args[0];

            expect(searchOptions.input).toBe(searchInput);
            expect(searchOptions.list).toBe(this.$columnList);
            expect(this.view.$(".explore")).toContainTranslation("actions.explore");
        });

        context("when in Edit Chorus View mode", function() {
            beforeEach(function() {
                this.view.options.inEditChorusView = true;
                this.view.render();
            });

            it("shows the definition and informational bar for Edit Chorus View", function() {
                expect(this.view.$(".edit_chorus_view")).not.toHaveClass("hidden");
                expect(this.view.$(".edit_chorus_view_info")).not.toHaveClass("hidden");
            });
        });

        it("subscribes to the action:closePreview broadcast", function() {
            expect(chorus.PageEvents.hasSubscription("action:closePreview", this.view.closeDataPreview, this.view)).toBeTruthy();
        });

        describe("sql definition", function() {
            context("when the object is a databaseObject", function() {
                it("shows the SQL definition in the header", function() {
                    expect(this.view.$(".sql_content")).toExist();
                    expect(this.view.$(".definition")).toContainText(this.tabularData.statistics().get("definition"));
                });

                context("when there is no sql", function() {
                    beforeEach(function() {
                        var tabularData = newFixtures.dataset.sourceTable()
                        this.view = new chorus.views.TabularDataContentDetails({tabularData: tabularData, collection: this.collection});
                        this.server.completeFetchFor(tabularData.statistics(), fixtures.datasetStatisticsTable());
                        this.view.render();
                    });

                    it("does not show the SQL definition", function() {
                        expect(this.view.$(".sql_content")).not.toExist();
                    })
                });
            });

            context("when the object is a CHORUS VIEW", function() {
                beforeEach(function() {
                    var tabularData = newFixtures.dataset.chorusView();
                    this.view = new chorus.views.TabularDataContentDetails({tabularData: tabularData, collection: this.collection});
                    this.server.completeFetchFor(tabularData.statistics());
                    this.view.render();

                });
                it("shows the SQL definition in the header", function() {
                    expect(this.view.$(".sql_content")).toExist();
                    expect(this.view.$(".definition")).toContainText(this.view.tabularData.get("query"));
                });
            });
        });

        context("when 'Preview Data'/'Run' is clicked", function() {
            context("when in default dataset page", function() {
                beforeEach(function() {
                    this.view.$(".column_count .preview").click();
                })

                it("should hide the column count bar", function() {
                    expect(this.view.$(".column_count")).toHaveClass("hidden");
                })

                it("should display the data preview bar", function() {
                    expect(this.view.$(".data_preview")).not.toHaveClass("hidden");
                })

                describe("data preview bar", function() {
                    it("should display a close button", function() {
                        expect(this.view.$(".data_preview .close")).toExist();
                    })

                    context("when the close button is clicked", function() {
                        beforeEach(function() {
                            this.view.$(".data_preview .close").click();
                        });

                        it("should hide the data preview bar", function() {
                            expect(this.view.$(".data_preview")).toHaveClass("hidden");
                        });

                        it("should show the column count bar", function() {
                            expect(this.view.$(".column_count")).not.toHaveClass("hidden");
                        });
                    });

                    context("when the preview data button is clicked", function() {
                        beforeEach(function() {
                            spyOn(this.view.resultsConsole, "execute");
                            this.view.$(".preview").click();
                        });

                        it("should execute database preview model", function() {
                            expect(this.view.resultsConsole.execute).toHaveBeenCalledWithSorta(this.view.tabularData.preview(), ["checkId"]);
                        });
                    });
                })
            });

            context("when in editChorusView page", function() {
                beforeEach(function() {
                    this.view.options.inEditChorusView = true;
                    this.view.render();
                    this.view.$(".preview").click();
                });

                it("should hide the edit chorus view bar", function() {
                    expect(this.view.$(".edit_chorus_view_info")).toHaveClass("hidden");
                });

                it("should display the data preview bar", function() {
                    expect(this.view.$(".data_preview")).not.toHaveClass("hidden");
                });
                describe("data preview bar", function() {
                    it("should display a close button", function() {
                        expect(this.view.$(".data_preview .close")).toExist();
                    })

                    context("when the close button is clicked", function() {
                        beforeEach(function() {
                            this.view.$(".data_preview .close").click();
                        });

                        it("should hide the data preview bar", function() {
                            expect(this.view.$(".data_preview")).toHaveClass("hidden");
                        });

                        it("should show the column count bar", function() {
                            expect(this.view.$(".edit_chorus_view_info")).not.toHaveClass("hidden");
                        });
                    });

                    context("when the preview data button is clicked", function() {
                        beforeEach(function() {
                            spyOn(this.view.resultsConsole, "execute");
                            this.view.$("button.preview").click();
                        });

                        it("should execute database preview model", function() {
                            expect(this.view.resultsConsole.execute).toHaveBeenCalledWithSorta(this.view.tabularData.preview(), ["checkId"]);
                        });
                    });
                });
            });
        });

        describe("definition bar", function() {
            it("renders", function() {
                expect(this.view.$(".definition")).toExist();
            });

            it("renders the 'Visualize' button", function() {
                expect(this.view.$("button.visualize")).toExist();
                expect(this.view.$("button.visualize").text()).toMatchTranslation("dataset.content_details.visualize");
            });

            it("doesn't render the chorus view info bar", function() {
                expect(this.view.$(".chorus_view_info")).toHaveClass("hidden");
            });

            context("and the visualize button is clicked", function() {
                beforeEach(function() {
                    spyOn(this.view, 'showVisualizationConfig');
                    spyOn(chorus.PageEvents, 'broadcast').andCallThrough();
                    this.view.filterWizardView.resetFilters.reset();
                    this.view.$("button.visualize").click();
                });

                it("selects the first chart type", function() {
                    expect(this.view.$('.create_chart .chart_icon:eq(0)')).toHaveClass('selected');
                });

                it("calls 'showVisualizationConfig' with the first chart type", function() {
                    var chartType = this.view.$('.create_chart .chart_icon:eq(0)').data('chart_type');
                    expect(this.view.showVisualizationConfig).toHaveBeenCalledWith(chartType);
                });

                it("hides the definition bar and shows the create_chart bar", function() {
                    expect(this.view.$('.definition')).toHaveClass('hidden');
                    expect(this.view.$('.create_chart')).not.toHaveClass('hidden');
                });

                it("hides column_count and shows info_bar", function() {
                    expect(this.view.$('.column_count')).toHaveClass('hidden');
                    expect(this.view.$('.info_bar')).not.toHaveClass('hidden');
                });

                it("shows the filters div", function() {
                    expect(this.view.$(".filters")).not.toHaveClass("hidden");
                });

                it("disables datasetNumbers on the filter wizard", function() {
                    expect(this.view.filterWizardView.options.showAliasedName).toBeFalsy();
                });

                it("resets filter wizard", function() {
                    expect(this.view.filterWizardView.resetFilters).toHaveBeenCalled();
                });

                it("broadcasts start:visualization", function() {
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("start:visualization");
                })


                context("and cancel is clicked", function() {
                    beforeEach(function() {
                        this.view.$('.create_chart .cancel').click();
                    });

                    it("shows the definition bar and hides the create_chart bar", function() {
                        expect(this.view.$('.definition')).not.toHaveClass('hidden');
                        expect(this.view.$('.create_chart')).toHaveClass('hidden');
                    });

                    it("hides the filters div", function() {
                        expect(this.view.$(".filters")).toHaveClass("hidden");
                    });

                    it("shows the column_count and hides info_bar", function() {
                        expect(this.view.$('.column_count')).not.toHaveClass('hidden');
                        expect(this.view.$('.info_bar')).toHaveClass('hidden');
                    });

                    it("hides the chart config view", function() {
                        expect(this.view.$(".chart_config")).toHaveClass("hidden");
                    });

                    it("broadcasts cancel:visualization", function() {
                       expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("cancel:visualization");
                    });
                })

                context("and a chart type is clicked", function() {
                    beforeEach(function() {
                        var chartIcon = this.view.$('.create_chart .chart_icon:eq(3)').click();
                        this.firstChartType = chartIcon.data('chart_type');
                    });

                    it("selects that icon", function() {
                        expect(this.view.$('.create_chart .chart_icon.' + this.firstChartType)).toHaveClass('selected');
                    });

                    it("calls #showVisualizationConfig with that chart type", function() {
                        expect(this.view.showVisualizationConfig).toHaveBeenCalledWith(this.firstChartType);
                    });

                    it("shows the title for that chart type", function() {
                        var chartType =
                            expect(this.view.$('.title.' + this.firstChartType)).not.toHaveClass('hidden');
                    });

                    context("and a different chart type is hovered over", function() {
                        beforeEach(function() {
                            var chartIcon = this.view.$('.create_chart .chart_icon:eq(2)');
                            this.hoverChartType = chartIcon.data('chart_type');
                            chartIcon.mouseenter();
                        });

                        it("shows the title for the hovered icon and hides the selected title", function() {
                            expect(this.view.$('.title.' + this.hoverChartType)).not.toHaveClass('hidden');
                            expect(this.view.$('.title.' + this.firstChartType)).toHaveClass('hidden');
                        });

                        context("and we stop hovering", function() {
                            beforeEach(function() {
                                var chartIcon = this.view.$('.create_chart .chart_icon:eq(2)');
                                chartIcon.mouseleave();
                            });

                            it("shows the selected title for the hovered icon and hides the hovered title", function() {
                                expect(this.view.$('.title.' + this.hoverChartType)).toHaveClass('hidden');
                                expect(this.view.$('.title.' + this.firstChartType)).not.toHaveClass('hidden');
                            });
                        })
                    })

                    context("and a different chart type is clicked", function() {
                        beforeEach(function() {
                            var chartIcon = this.view.$('.create_chart .chart_icon:eq(1)').click();
                            this.secondChartType = chartIcon.data('chart_type');
                        });

                        it("selects that icon", function() {
                            expect(this.view.$('.create_chart .chart_icon:eq(0)')).not.toHaveClass('selected');
                            expect(this.view.$('.create_chart .chart_icon:eq(1)')).toHaveClass('selected');
                        });

                        it("shows that title and hides the other visible ones", function() {
                            expect(this.view.$('.title.' + this.secondChartType)).not.toHaveClass('hidden');
                            expect(this.view.$('.title.' + this.firstChartType)).toHaveClass('hidden');
                        });
                    });
                });
            });

            context("and the derive a chorus view button is clicked", function() {
                beforeEach(function() {
                    this.view.filterWizardView.resetFilters.reset();
                    this.chorusViewSpy = spyOnEvent(this.view, "transform:sidebar");
                    spyOnEvent(".column_count input.search", "textchange");
                    spyOnEvent(".chorus_view_info input.search", "textchange");

                    this.view.$('button.derive').click();
                });

                it("unsubscribes from the action:closePreview broadcast", function() {
                    expect(chorus.PageEvents.hasSubscription("action:closePreview", this.view.closeDataPreview, this.view)).toBeFalsy();
                });

                it("swap the green definition bar to Create Bar", function() {
                    expect(this.view.$(".create_chorus_view")).not.toHaveClass("hidden");
                    expect(this.view.$(".create_chart")).toHaveClass("hidden");
                    expect(this.view.$(".definition")).toHaveClass("hidden");
                });

                it("shows the chorus view info bar", function() {
                    expect(this.view.$(".chorus_view_info")).not.toHaveClass("hidden");
                    expect(this.view.$(".info_bar")).toHaveClass("hidden");
                    expect(this.view.$(".column_count")).toHaveClass("hidden");
                    expect(this.view.$(".chorus_view_info").text()).toContainTranslation("workspaces.select");
                });

                it("triggers the 'textchange' event on the newly visible search input", function() {
                    expect("textchange").not.toHaveBeenTriggeredOn(".column_count input.search");
                    expect("textchange").toHaveBeenTriggeredOn(".chorus_view_info input.search");
                });

                it("has a search field in the content details that filters the column list", function() {
                    var searchInput = this.view.$("input.search:visible");

                    expect(searchInput).toExist();
                    expect(chorus.search).toHaveBeenCalled();
                    var searchOptions = chorus.search.mostRecentCall.args[0];

                    expect(searchOptions.input).toBe(searchInput);
                    expect(searchOptions.list).toBe(this.$columnList);
                });

                it("should select the chorus view icon", function() {
                    expect(this.view.$('.create_chorus_view .chorusview')).toHaveClass("selected");
                });

                it("shows the filter section", function() {
                    expect(this.view.$(".filters")).not.toHaveClass("hidden")
                });

                it("triggers transform:sidebar", function() {
                    expect(this.chorusViewSpy).toHaveBeenCalled();
                })

                it("enables datasetNumbers on the filter wizard", function() {
                    expect(this.view.filterWizardView.options.showAliasedName).toBeTruthy();
                });

                it("resets filter wizard", function() {
                    expect(this.view.filterWizardView.resetFilters).toHaveBeenCalled();
                });

                describe("clicking 'Select All'", function() {
                    beforeEach(function() {
                        spyOn(chorus.PageEvents, "broadcast");
                        this.view.$(".select_all").click();
                    })

                    it("broadcasts the column:select_all page event", function() {
                        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("column:select_all");
                    });
                });

                describe("clicking 'Select None'", function() {
                    beforeEach(function() {
                        spyOn(chorus.PageEvents, "broadcast");
                        this.view.$(".select_none").click();
                    })

                    it("broadcasts the column:select_none page event", function() {
                        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("column:select_none");
                    });
                });

                describe("and the cancel link is clicked", function() {
                    beforeEach(function() {
                        spyOn(chorus.PageEvents, "broadcast");
                        jasmine.JQuery.events.cleanUp();
                        spyOnEvent(".column_count input.search", "textchange");
                        spyOnEvent(".chorus_view_info input.search", "textchange");

                        this.cancelSpy = spyOnEvent(this.view, "cancel:sidebar");
                        this.view.$(".create_chorus_view .cancel").click();
                    });

                    it("subscribes to the action:closePreview broadcast", function() {
                        expect(chorus.PageEvents.hasSubscription("action:closePreview", this.view.closeDataPreview, this.view)).toBeTruthy();
                    });

                    it("swap the Create Bar to green definition bar", function() {
                        expect(this.view.$(".create_chorus_view")).toHaveClass("hidden");
                        expect(this.view.$(".definition")).not.toHaveClass("hidden");
                    })

                    it("hides the filters section", function() {
                        expect(this.view.$(".filters")).toHaveClass("hidden")
                    });

                    it("shows the chorus view info bar", function() {
                        expect(this.view.$(".chorus_view_info")).toHaveClass("hidden");
                        expect(this.view.$(".column_count")).not.toHaveClass("hidden");
                    });

                    it("triggers the 'textchange' event on the newly visible search input", function() {
                        expect("textchange").toHaveBeenTriggeredOn(".column_count input.search");
                        expect("textchange").not.toHaveBeenTriggeredOn(".chorus_view_info input.search");
                    });

                    it("triggers 'cancel:sidebar'", function() {
                        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith('cancel:sidebar', 'chorus_view');
                    });
                });
            })

            context("when the tabularData is not a chorus view", function() {
                it("should not display the edit chorus view button", function() {
                    expect(this.view.$("button.edit")).not.toExist();
                });

                context("when the workspace is archived", function() {
                    beforeEach(function() {
                        var tabularData = newFixtures.dataset.sourceTable();
                        var workspace = newFixtures.workspace({ active: false, state: 0 });
                        tabularData.initialQuery = "select * from abc";
                        this.view = new chorus.views.TabularDataContentDetails({tabularData: tabularData, collection: this.collection, workspace: workspace});
                        this.server.completeFetchFor(tabularData.statistics());
                        this.view.render();
                    });
                    it("should not display the derive chorus view button", function() {
                        expect(this.view.$("button.derive")).not.toExist();
                    });
                });

                context("when the workspace is active", function() {
                    beforeEach(function() {
                        var tabularData = newFixtures.dataset.sourceTable();
                        var workspace = newFixtures.workspace({active: true});
                        tabularData.initialQuery = "select * from abc";
                        this.view = new chorus.views.TabularDataContentDetails({tabularData: tabularData, collection: this.collection, workspace: workspace});
                        this.server.completeFetchFor(tabularData.statistics());
                        this.view.render();
                    });
                    it("should display the derive chorus view button", function() {
                        expect(this.view.$("button.derive")).toExist();
                    });
                });
            });

            context("when the tabularData is a chorus view", function() {

                context("when the workspace is archived", function() {
                    beforeEach(function() {
                        var tabularData = newFixtures.dataset.chorusView();
                        var workspace = newFixtures.workspace({ active: false, state: 0 });
                        tabularData.initialQuery = "select * from abc";
                        this.view = new chorus.views.TabularDataContentDetails({tabularData: tabularData, collection: this.collection, workspace: workspace});
                        this.server.completeFetchFor(tabularData.statistics());
                        this.view.render();
                    });

                    it("does not display the derive chorus view button", function() {
                        expect(this.view.$("button.derive")).not.toExist();
                    });

                    it("does not display the edit button", function() {
                        expect(this.view.$("button.edit")).not.toExist();
                    });
                });

                context("when the workspace is not archived", function() {
                    beforeEach(function() {
                        var tabularData = newFixtures.dataset.chorusView();
                        tabularData.initialQuery = "select * from abc";
                        var workspace = newFixtures.workspace({active: true})
                        this.view = new chorus.views.TabularDataContentDetails({tabularData: tabularData, collection: this.collection, workspace: workspace});
                        this.server.completeFetchFor(tabularData.statistics());
                        this.view.render();
                    });
                    it("does not display the derive chorus view button", function() {
                        expect(this.view.$("button.derive")).not.toExist();
                    });
                    context("and the edit button is clicked", function() {
                        beforeEach(function() {
                            this.chorusViewSpy = spyOnEvent(this.view, "transform:sidebar");
                            spyOnEvent(this.view, "dataset:edit");
                            this.view.$("button.edit").click();
                        });
                        it("swap the green definition bar to Edit chorus view bar", function() {
                            expect(this.view.$(".edit_chorus_view")).not.toHaveClass("hidden");
                            expect(this.view.$(".create_chorus_view")).toHaveClass("hidden");
                            expect(this.view.$(".create_chart")).toHaveClass("hidden");
                            expect(this.view.$(".definition")).toHaveClass("hidden");
                            expect(this.view.$(".edit_chorus_view").find("button.save")).toExist();
                        });
                        it("shows the edit chorus view info bar", function() {
                            expect(this.view.$(".edit_chorus_view_info")).not.toHaveClass("hidden");
                            expect(this.view.$(".info_bar")).toHaveClass("hidden");
                            expect(this.view.$(".column_count")).toHaveClass("hidden");
                            expect(this.view.$(".edit_chorus_view_info .left").text()).toContainTranslation("dataset.content_details.edit_chorus_view.info");
                            expect(this.view.$(".edit_chorus_view button.preview").text()).toContainTranslation("dataset.run_sql");
                        });
                        it("triggers dataset:edit", function() {
                            expect("dataset:edit").toHaveBeenTriggeredOn(this.view);
                        });
                        it("triggers transform:sidebar", function() {
                            expect(this.chorusViewSpy).toHaveBeenCalledWith("edit_chorus_view");
                        });
                        context("and cancel is clicked", function() {
                            beforeEach(function() {
                                spyOn(chorus.PageEvents, 'broadcast').andCallThrough();
                                spyOnEvent(this.view, "dataset:cancelEdit");
                                this.view.$('.edit_chorus_view .cancel').click();
                            });
                            it("shows the definition bar and hides the create_chart bar", function() {
                                expect(this.view.$('.definition')).not.toHaveClass('hidden');
                                expect(this.view.$('.edit_chorus_view')).toHaveClass('hidden');
                            });
                            it("shows the column_count and hides info_bar", function() {
                                expect(this.view.$('.column_count')).not.toHaveClass('hidden');
                                expect(this.view.$('.edit_chorus_view_info')).toHaveClass('hidden');
                            });
                            it("triggers 'cancel:sidebar'", function() {
                                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith('cancel:sidebar', 'chorus_view');
                            });
                            it("triggers dataset:cancelEdit", function() {
                                expect("dataset:cancelEdit").toHaveBeenTriggeredOn(this.view);
                            });
                            it("resets the query to the initial query", function() {
                                expect(this.view.tabularData.get("query")).toBe("select * from abc")
                            })
                        })
                        context("and 'Save and Return' is clicked", function() {
                            beforeEach(function() {
                                spyOnEvent(this.view, "dataset:saveEdit");
                                this.view.$(".save").click();
                            });
                            it("triggers dataset:saveEdit", function() {
                                expect("dataset:saveEdit").toHaveBeenTriggeredOn(this.view)
                            });
                        })
                    });
                });
            });
        });

        describe("column count bar", function() {
            beforeEach(function() {
                this.column = fixtures.databaseColumn();
            });

            it("renders", function() {
                expect(this.view.$(".column_count")).toExist();
            })

            it("renders the column count", function() {
                expect(this.view.$(".column_count .count").text().trim()).toMatchTranslation("dataset.column_count", { count: this.collection.models.length })
            })

            it("re-renders the column count when a column is added", function() {
                var count = this.view.collection.length;
                this.view.collection.add(this.column);
                expect(this.view.$(".column_count .count").text().trim()).toMatchTranslation("dataset.column_count", { count: count + 1 })
            });

            it("re-renders the column count when a column is removed", function() {
                this.view.collection.add(this.column);
                var count = this.view.collection.length;
                this.view.collection.remove(this.column);
                expect(this.view.$(".column_count .count").text().trim()).toMatchTranslation("dataset.column_count", { count: count - 1 })
            });
        });

        describe("column errors", function() {
            beforeEach(function() {
                spyOn(this.view, "showError");
                this.collection.serverErrors = [{message: "No permission"}];
                this.view.render();
            });

            it("shows errors in the main content area", function() {
                expect(this.view.showError).toHaveBeenCalledWith(this.collection, chorus.alerts.Error);
            });
        });

        describe("sql errors bar", function() {
            it("renders, hidden", function() {
                expect(this.view.$(".sql_errors")).toHaveClass("hidden");
            });

            it("isn't cleared by clearErrors", function() {
                this.view.clearErrors();
                expect(this.view.$(".sql_errors").html()).not.toBe("");
            });

            describe("showError", function() {
                beforeEach(function() {
                    this.taskWithErrors = fixtures.taskWithErrors();
                    this.alertClass = chorus.alerts.VisualizationError;
                    this.view.showError(this.taskWithErrors, this.alertClass);
                });

                it("unhides .dataset_errors", function() {
                    expect(this.view.$(".dataset_errors")).not.toHaveClass('hidden');
                });

                it("sets the alertClass correctly", function() {
                    expect(this.view.alertClass).toBe(this.alertClass);
                });

                it("sets the task correctly", function() {
                    expect(this.view.taskWithErrors).toBe(this.taskWithErrors);
                });

                describe("clicking view_error_details", function() {
                    beforeEach(function() {
                        this.modalSpy = stubModals()
                        this.view.$('.view_error_details').click();
                    });

                    it("launches the alertClass with the task as the model", function() {
                        var modal = this.modalSpy.lastModal();
                        expect(modal).toBeA(this.alertClass);
                        expect(modal.model).toBe(this.taskWithErrors);
                    });
                });

                describe("closeError", function() {
                    beforeEach(function() {
                        this.view.closeError();
                    });

                    it("hides the .sql_errors", function() {
                        expect(this.view.$(".sql_errors")).toHaveClass('hidden');
                    });
                });
            });
        });

        describe("#showVisualizationConfig(type)", function() {
            beforeEach(function() {
                this.type = "frequency";
                var renderSpy = spyOn(
                    chorus.views.ChartConfiguration.prototype, 'postRender'
                ).andCallThrough();
                this.view.chartConfig = new chorus.views.Base();
                this.originalChartConfig = this.view.chartConfig
                spyOn(this.originalChartConfig, "cleanup");
                this.view.showVisualizationConfig(this.type);

                expect(renderSpy).toHaveBeenCalled();
                this.configView = renderSpy.mostRecentCall.object;
            });

            it("cleans up the old chartConfig", function() {
               expect(this.originalChartConfig.cleanup).toHaveBeenCalled();
            });

            it("renders a visualization configuration view for the given chart type", function() {
                expect(this.configView).toBeA(chorus.views.FrequencyChartConfiguration);
                expect(this.view.$(".chart_config")).not.toHaveClass('hidden');
            });

            it("passes the tabular data, column set and filter set to the config view", function() {
                expect(this.configView.model).toBe(this.view.tabularData);
                expect(this.configView.collection).toBe(this.view.collection);
                expect(this.configView.filters).toBe(this.view.filterWizardView.collection);
            });

            it("passes a reference to itself as the config view's 'error container'", function() {
                expect(this.configView.options.errorContainer).toBe(this.view);
            });
        });
    });
});
