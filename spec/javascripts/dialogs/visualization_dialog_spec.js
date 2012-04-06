describe("chorus.dialogs.Visualization", function() {
    beforeEach(function() {
        this.qtip = stubQtip();
        this.modalSpy = stubModals();
        stubDefer();
        stubClEditor();
        spyOn(chorus.Modal.prototype, "closeModal");

        this.dataset = fixtures.datasetSourceTable();
        this.columns = fixtures.databaseColumnSet([
            fixtures.databaseColumn(),
            fixtures.databaseColumn(),
            fixtures.databaseColumn()
        ], {tabularData: this.dataset});

        this.chartOptions = {type: "boxplot", name: "Foo"};

        var filter1 = new chorus.models.TabularDataFilter({column: this.columns.at(0), comparator: "equal", input: {value: "original_filter_value_a"}});
        var filter2 = new chorus.models.TabularDataFilter({column: this.columns.at(1), comparator: "not_equal", input: {value: "original_filter_value_b"}});

        this.filters = new chorus.collections.TabularDataFilterSet([filter1, filter2]);

        spyOn(this.filters, "clone").andCallThrough();
        this.dialog = new chorus.dialogs.Visualization({model: this.dataset, chartOptions: this.chartOptions, filters: this.filters, columnSet: this.columns});
        this.dialog.task = fixtures.boxplotTaskWithResult();

        spyOn(this.dialog, 'refreshChart').andCallThrough();
        spyOn(this.dialog, "launchSubModal").andCallThrough();
    });

    describe("#initialization", function() {
        describe("when the save completes", function() {
            beforeEach(function() {
                spyOn(chorus.views.visualizations, "Boxplot").andReturn(stubView())
                spyOn(this.dialog, "drawChart").andCallThrough()
            });

            describe("when the task data is valid", function() {
                beforeEach(function() {
                    spyOn(this.dialog, "isValidData").andReturn(true);
                    this.dialog.onExecutionComplete();
                });

                it("should draw the chart", function() {
                    expect(this.dialog.drawChart).toHaveBeenCalled();
                });

                it("enables the Save Chart button", function() {
                    expect(this.dialog.$("button.save")).toBeEnabled();
                });

                it("shows the Show Data link", function() {
                    expect(this.dialog.$("a.show")).not.toHaveClass('hidden');
                });

                it("shows the 'Show Options' link", function() {
                    expect(this.dialog.filters.length).toBe(2);
                    expect(this.dialog.$("a.show_options")).toContainTranslation("visualization.show_options", {count: 2});
                });

                it("clones the filters", function() {
                    expect(this.dialog.filters).not.toBe(this.filters);
                    expect(this.filters.clone).toHaveBeenCalled();
                });
            });

            describe("when the task data is not valid", function() {
                beforeEach(function() {
                    spyOn(this.dialog, "isValidData").andReturn(false);
                    this.dialog.render();
                    this.dialog.onExecutionComplete();
                })

                it("does not enable the save chart button", function() {
                    expect(this.dialog.$("button.save")).toBeDisabled();
                });

                it("hides the Show Data link", function() {
                    expect(this.dialog.$("a.show")).toHaveClass('hidden');
                });

                it("does not have a chart", function() {
                    expect(this.dialog.chart).toBeUndefined();
                });

                it("has a notification of empty data", function() {
                    expect(this.dialog.$(".empty_data")).toContainTranslation("visualization.empty_data");
                });
            });
        });
    });

    describe("#isValidData", function() {
        describe("it has rows", function() {
            beforeEach(function() {
                this.chartOptions["type"] = "histogram";
                this.dialog = new chorus.dialogs.Visualization({model: this.dataset, chartOptions: this.chartOptions, filters: this.filters, columnSet: this.columns});
                this.dialog.task = fixtures.boxplotTaskWithResult();
            })

            it("should be valid", function() {
                expect(this.dialog.isValidData()).toBeTruthy()
            })
        })

        describe("it has no rows", function() {
            beforeEach(function() {
                this.chartOptions["type"] = "histogram";
                this.dialog = new chorus.dialogs.Visualization({model: this.dataset, chartOptions: this.chartOptions, filters: this.filters, columnSet: this.columns});
                this.dialog.task = fixtures.task({result: {rows: []}});
            })

            it("should not be valid", function() {
                expect(this.dialog.isValidData()).toBeFalsy()
            })
        })
    })

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
        });

        it("should show the 'Show Options' link by default", function() {
            expect(this.dialog.$("a.show_options")).not.toHaveClass("hidden");
            expect(this.dialog.$("a.hide_options")).toHaveClass("hidden");
        });

        it("does not show the overlay by default", function() {
            expect(this.dialog.$('.overlay')).toHaveClass('hidden');
        });

        it("hides the refresh, revert and cancel buttons by default", function() {
            expect(this.dialog.$("button.refresh")).toHaveClass("hidden");
            expect(this.dialog.$("button.revert")).toHaveClass("hidden");
            expect(this.dialog.$('button.stop')).toHaveClass('hidden');
        });

        context("clicking on the 'Show Options' link", function() {
            beforeEach(function() {
                this.dialog.$("a.show_options").click();
            });

            it("shows the filter section", function() {
                expect(this.dialog.$(".filter_options")).not.toHaveClass("hidden");
            });

            context("when there are existing filters", function() {
                it("shows them properly in the filter section", function() {
                    expect(this.dialog.$(".filter_options li").length).toBe(2);
                    expect(this.dialog.$(".filter_options li:eq(0) .column_filter option:selected").text()).toBe(this.columns.at(0).get("name"));
                    expect(this.dialog.$(".filter_options li:eq(1) .column_filter option:selected").text()).toBe(this.columns.at(1).get("name"));
                    expect(this.dialog.$(".filter_options li:eq(0) select.comparator option:selected").val()).toBe("equal");
                    expect(this.dialog.$(".filter_options li:eq(1) select.comparator option:selected").val()).toBe("not_equal");
                    expect(this.dialog.$(".filter_options li:eq(0) input").val()).toBe("original_filter_value_a");
                    expect(this.dialog.$(".filter_options li:eq(1) input").val()).toBe("original_filter_value_b");
                });
            });

            context("adding filters", function() {
                beforeEach(function() {
                    // Really add filters to dialog - not a stub
                    this.dialog.filterWizard.addFilter()
                    this.dialog.filterWizard.addFilter()
                    this.dialog.filterWizard.render();
                    this.dialog.filterWizard.$(".default input").val("AA").keyup();
                });

                it("renders the correct number of filters when adding", function() {
                    expect(this.dialog.$(".filter_options li").length).toBe(4);
                });

                itRespondsToFilterUpdates();
            });

            context("changing filters", function() {
                beforeEach(function() {
                    this.dialog.filterWizard.$(".filter input").val("AA").trigger("keyup");
                });

                itRespondsToFilterUpdates();
            });

            it("swaps out show/hide options links", function() {
                expect(this.dialog.$("a.show_options")).toHaveClass('hidden');
                expect(this.dialog.$("a.hide_options")).not.toHaveClass('hidden');
            });

            context("clicking the 'Hide Options' link", function() {
                beforeEach(function() {
                    this.dialog.$("a.hide_options").click();
                });

                it("hides the filter section", function() {
                    expect(this.dialog.$(".filter_options")).toHaveClass("hidden");
                });

                it("swaps out show/hide options links", function() {
                    expect(this.dialog.$("a.show_options")).not.toHaveClass('hidden');
                    expect(this.dialog.$("a.hide_options")).toHaveClass('hidden');
                });
            });
        });

        context("when the rows are empty", function() {
            beforeEach(function() {
                spyOn(this.dialog, "isValidData").andReturn(false)
                this.dialog.onExecutionComplete()
            });

            it("disables the 'Save' button", function() {
                expect(this.dialog.$("button.save")).toBeDisabled();
            });

            it("should not show the 'Show Data Table' link (until the chart is loaded)", function() {
                expect(this.dialog.$(".modal_controls a.show")).toHaveClass("hidden");
            });
        })

        context("when the rows are valid", function() {
            beforeEach(function() {
                this.dialog.onExecutionComplete();
            });

            it("should have a title", function() {
                expect(this.dialog.title).toMatchTranslation("visualization.title", {name: "Foo"});
            });

            it("should have a 'Save' button", function() {
                expect(this.dialog.$("button.save")).toContainTranslation("actions.save")
            });

            context("clicking the save button", function() {
                beforeEach(function() {
                    this.dialog.$("button.save").click();
                });

                it("should have a 'Save Chart Image as Workfile' link", function() {
                    expect(this.qtip.find("a.save_as_workfile")).toContainTranslation("visualization.save_as_workfile");
                });

                it("should have a 'Save Chart Image as attachment' link", function() {
                    expect(this.qtip.find("a.save_as_note")).toContainTranslation("visualization.save_as_note");
                });

                it("should have a 'Save Chart Image to Desktop' link", function() {
                    expect(this.qtip.find("a.save_to_desktop")).toContainTranslation("visualization.save_to_desktop");
                });
            });

            it("should have a 'Show Data Table' link", function() {
                expect(this.dialog.$(".modal_controls a.show")).toContainTranslation("visualization.show_table")
            });

            it("should have a 'Hide Data Table' link", function() {
                expect(this.dialog.$(".modal_controls a.hide")).toContainTranslation("visualization.hide_table");
            });

            it("should have a 'Close' button", function() {
                expect(this.dialog.$("button.close_dialog")).toContainTranslation("actions.close");
            });

            describe("the icon bar", function() {
                it("should display the icons in the correct order", function() {
                    expect(this.dialog.$(".chart_icon").eq(0)).toHaveClass("frequency");
                    expect(this.dialog.$(".chart_icon").eq(1)).toHaveClass("histogram");
                    expect(this.dialog.$(".chart_icon").eq(2)).toHaveClass("heatmap");
                    expect(this.dialog.$(".chart_icon").eq(3)).toHaveClass("timeseries");
                    expect(this.dialog.$(".chart_icon").eq(4)).toHaveClass("boxplot");
                });

                it("should select the icon according to the dialog options", function() {
                    expect(this.dialog.$(".chart_icon.frequency")).not.toHaveClass("selected");
                    expect(this.dialog.$(".chart_icon.histogram")).not.toHaveClass("selected");
                    expect(this.dialog.$(".chart_icon.heatmap")).not.toHaveClass("selected");
                    expect(this.dialog.$(".chart_icon.timeseries")).not.toHaveClass("selected");
                    expect(this.dialog.$(".chart_icon.boxplot")).toHaveClass("selected");
                });

                it("should have the correct chart type text", function() {
                    expect(this.dialog.$(".headerbar .label")).toContainTranslation("dataset.visualization.names.boxplot");
                });
            });

            describe("the results console", function() {
                it("should be hidden", function() {
                    expect(this.dialog.$(".results_console")).toHaveClass("hidden");
                });

                it("should hide the 'Hide Data Table' link", function() {
                    expect(this.dialog.$(".modal_controls a.hide")).toHaveClass("hidden");
                });

                it("actually has columns", function() {
                    expect(this.dialog.$(".data_table .column").length).toBeGreaterThan(1);
                })
            });

            describe("the close button", function() {
                beforeEach(function() {
                    this.dialog.$("button.close_dialog").click();
                });

                it("should close the dialog", function() {
                    expect(chorus.Modal.prototype.closeModal).toHaveBeenCalled();
                });
            });

            describe("downloading the chart", function() {
                describe("clicking on the 'save chart' button", function() {
                    beforeEach(function() {
                        this.submitSpy = jasmine.createSpy("submit");
                        this.hideSpy = jasmine.createSpy("hide");

                        this.fakeForm = {
                            submit: this.submitSpy,
                            hide: this.hideSpy
                        }

                        spyOn(this.dialog, "createDownloadForm").andReturn(this.fakeForm)
                        this.dialog.$("button.save").prop("disabled", false);
                        this.dialog.$("button.save").click();
                        this.qtip.find("a.save_to_desktop").click();
                    });

                    it("constructs a form for download", function() {
                        expect(this.dialog.createDownloadForm).toHaveBeenCalled();
                    });

                    it("hides the form", function() {
                        expect(this.hideSpy).toHaveBeenCalled();
                    });

                    it("submits the form", function() {
                        expect(this.submitSpy).toHaveBeenCalled();
                    });
                })

                describe("constructing the download form", function() {
                    beforeEach(function() {
                        this.dialog.$(".chart_area").addClass("visualization").append("<svg/>");
                        this.form = this.dialog.createDownloadForm();
                    });

                    it("has the correct action", function() {
                        expect(this.form).toHaveAttr("action", "/downloadChart.jsp");
                    });

                    it("has the correct form elements", function() {
                        expect($("input[name=svg]", this.form)).toExist();
                        expect($("input[name=chart-name]", this.form)).toHaveValue("Foo");
                        expect($("input[name=chart-type]", this.form)).toHaveValue("boxplot");
                    });
                });
            });

            describe("saving as work file", function() {
                context("when the dialog was launched from within a workspace", function() {
                    describe("clicking on the 'save as work file' button", function() {
                        beforeEach(function() {
                            spyOn(chorus.models.Workfile.prototype, 'save').andCallThrough();
                            this.dialog.$(".chart_area").addClass("visualization").append("<svg/>");
                            this.dialog.$("button.save").prop("disabled", false);
                            this.dialog.$("button.save").click();
                            this.qtip.find("a.save_as_workfile").click();
                        });

                        it("disables the save as workfile button and shows the loading spinner", function() {
                            expect(this.dialog.$("button.save").isLoading()).toBeTruthy();
                        });

                        it("makes a workfile with the correct elements", function() {
                            expect(this.dialog.workfile.get("svgData")).toBeDefined();
                            expect(this.dialog.workfile.get("source")).toBe("visualization");
                            expect(this.dialog.workfile.get("fileName")).toBe("Foo-boxplot.png");
                        });

                        describe("when the table name contains characters not valid in a workfile name", function() {
                            beforeEach(function() {
                                this.dialog.options.chartOptions.name = "this'that/the_other";
                                this.dialog.$(".chart_area").addClass("visualization").append("<svg/>");
                                this.dialog.$("button.save").prop("disabled", false);
                                this.dialog.$("button.save").click();
                                this.qtip.find("a.save_as_workfile").click();
                            });

                            it("strips the offending characters", function() {
                                expect(this.dialog.workfile.get("fileName")).toBe("thisthatthe_other-boxplot.png")
                            });
                        })

                        it("saves the workfile", function() {
                            expect(this.dialog.workfile.save).toHaveBeenCalled();
                        });

                        context("when the save completes", function() {
                            beforeEach(function() {
                                spyOn(chorus, "toast");
                                this.server.completeSaveFor(this.dialog.workfile, {fileName: "Foo-boxplot_2.png"});
                            });

                            it("should restore the save as workfile button", function() {
                                expect(this.dialog.$('button.save').isLoading()).toBeFalsy();
                            });

                            it("shows a toast message", function() {
                                expect(chorus.toast).toHaveBeenCalledWith("dataset.visualization.toast.workfile_from_chart", {fileName: "Foo-boxplot_2.png"});
                            });
                        });
                    });
                });

                context("when the dialog was launched from outside of a workspace", function() {
                    beforeEach(function() {
                        this.dialog.task.unset("workspaceId");
                        spyOn(chorus.models.Workfile.prototype, 'save').andCallThrough();
                        this.dialog.$(".chart_area").addClass("visualization").append("<svg/>");
                        this.dialog.$("button.save").prop("disabled", false);
                        this.dialog.$("button.save").click();
                        this.qtip.find("a.save_as_workfile").click();
                    });

                    it("should display the workspace picker", function() {
                        expect(this.modalSpy).toHaveModal(chorus.dialogs.VisualizationWorkspacePicker);
                    });

                    it("should not start the spinner", function() {
                        expect(this.dialog.$("button.save").isLoading()).toBeFalsy();
                    });

                    context("when a workspace is selected", function() {
                        beforeEach(function() {
                            this.workspace = newFixtures.workspace({id: "543"});
                            this.dialog.workspacePicker.trigger("workspace:selected", this.workspace);
                        });

                        it("saves the workfile in the selected workspace", function() {
                            var workfile = new chorus.models.Workfile({workspaceId: "543"});
                            expect(this.server.lastCreate().url).toMatchUrl(workfile.url());
                        });

                        it("starts the spinner", function() {
                            expect(this.dialog.$("button.save").isLoading()).toBeTruthy();
                        });
                    });
                });
            });

            describe("saving as attachment to a note on this dataset", function() {
                beforeEach(function() {
                    this.dialog.$("button.save").prop("disabled", false);
                    this.dialog.$("button.save").click();
                    this.qtip.find("a.save_as_note").click();
                });

                it("opens the Add Note dialog with correct parameters", function() {
                    expect(this.dialog.launchSubModal).toHaveBeenCalledWith(this.dialog.notesNewDialog);

                    expect(this.dialog.notesNewDialog).toBeA(chorus.dialogs.VisualizationNotesNew);
                    expect(this.dialog.notesNewDialog.pageModel).toBe(this.dialog.model);
                    expect(this.dialog.notesNewDialog.options.launchElement).toBe(this.qtip.find("a.save_as_note"));
                    expect(this.dialog.notesNewDialog.options.launchElement.data("allow-workspace-attachments")).toBeTruthy();
                    expect(this.dialog.notesNewDialog.options.attachVisualization.fileName).toBe(this.dialog.makeFilename());
                    expect(this.dialog.notesNewDialog.options.attachVisualization.svgData).toBe(this.dialog.makeSvgData())
                });

                context("when the dialog is launched outside workspace context", function() {
                    beforeEach(function() {
                        this.dialog.task.unset("workspaceId");
                        this.dialog.render();
                        this.dialog.$("button.save").prop("disabled", false);
                        this.dialog.$("button.save").click();
                        this.qtip.find("a.save_as_note").click();
                    });

                    it("should not allow workspace attachments", function() {
                        expect(this.dialog.notesNewDialog.options.launchElement.data("allow-workspace-attachments")).toBeFalsy();
                    });
                });
            });
        });
    });

    describe("#makeFileName", function() {
        beforeEach(function() {
            this.dialog.options.chartOptions = { name: "%Foo", type: "frequency"};
        });

        it("returns a fileName", function() {
            expect(this.dialog.makeFilename()).toBe("Foo-frequency.png");
        });
    });

    describe("show and hide tabular data", function() {
        beforeEach(function() {
            this.dialog.render();
        });

        describe("clicking on the 'Show Data Table' link", function() {
            beforeEach(function() {
                this.dialog.$(".modal_controls a.show").click();
            });

            it("should show the data table", function() {
                expect(this.dialog.$(".results_console")).not.toHaveClass("hidden");
            })

            it("should hide the show table link", function() {
                expect(this.dialog.$(".modal_controls a.show")).toHaveClass("hidden");
            })

            it("should show the hide table link", function() {
                expect(this.dialog.$(".modal_controls a.hide")).not.toHaveClass("hidden");
            })

            describe("clicking on the 'Hide Chart Data' link", function() {
                beforeEach(function() {
                    this.dialog.$(".modal_controls a.hide").click();
                });

                it("should hide the data table", function() {
                    expect(this.dialog.$(".results_console")).toHaveClass("hidden");
                });

                it("should show the 'Show Data Table' link", function() {
                    expect(this.dialog.$(".modal_controls a.show")).not.toHaveClass("hidden");
                });

                it("should hide the 'Hide Data Table' link", function() {
                    expect(this.dialog.$(".modal_controls a.hide")).toHaveClass("hidden");
                });
            });
        });
    });

    function itRespondsToFilterUpdates() {
        itShowsThatOptionsHaveChanged();

        it("refreshes the chart when clicking the 'refresh visualization' button", function() {
            this.dialog.$("button.refresh").click();
            expect(this.dialog.refreshChart).toHaveBeenCalled();
        });

        it("refreshes the chart when clicking the overlay", function() {
            this.dialog.$(".overlay").click();
            expect(this.dialog.refreshChart).toHaveBeenCalled();
        });

        describe("clicking the revert button", function() {
            beforeEach(function() {
                this.dialog.$("button.revert").click();
            });

            it("sets the filters as they were when the dialog was initialized", function() {
                var valueInputs = this.dialog.$(".filter_options li .default input");
                expect(valueInputs.eq(0).val()).toBe("original_filter_value_a");
                expect(valueInputs.eq(1).val()).toBe("original_filter_value_b");
            });

            itReturnsToOriginalState();
        });

        describe("#refreshChart", function() {
            beforeEach(function() {
                this.server.reset();
                spyOn(this.dialog.filters, "whereClause").andReturn("newSql");
                spyOn(this.dialog, "drawChart").andCallThrough();
                this.dialog.refreshChart();
            });

            it("submits a new task", function() {
                expect(this.server.lastCreate().url).toBe(this.dialog.task.url());
                expect(this.dialog.$('button.refresh').isLoading()).toBeTruthy();
                expect(this.dialog.$('button.refresh')).toContainTranslation("visualization.refreshing");
            });

            it("disables clicking the overlay", function() {
                this.dialog.refreshChart.reset();
                this.dialog.$(".overlay").click();
                expect(this.dialog.$(".overlay")).not.toHaveClass("hidden");
                expect(this.dialog.$(".overlay")).toHaveClass("disabled");
                expect(this.dialog.refreshChart).not.toHaveBeenCalled();
            });

            it("shows the cancel button and hides the revert button", function() {
                expect(this.dialog.$("button.revert")).toHaveClass("hidden");
                expect(this.dialog.$("button.stop")).not.toHaveClass("hidden");
                expect(this.dialog.$("button.stop")).toContainTranslation("actions.cancel");
            });

            it("updates the task sql", function() {
                expect(this.dialog.task.get("filters")).toBe("newSql");
            });

            describe("clicking the 'cancel' button", function() {
                beforeEach(function() {
                    spyOn(this.dialog.task, 'cancel').andCallThrough();
                    this.dialog.$("button.stop").click();
                });

                it("cancels the task", function() {
                    expect(this.dialog.task.cancel).toHaveBeenCalled();
                });

                describe("when the cancel completes", function() {
                    beforeEach(function() {
                        this.server.lastUpdate().succeed();
                    });

                    itShowsThatOptionsHaveChanged();
                });
            });

            context("and the task save completes", function() {
                beforeEach(function() {
                    this.server.completeSaveFor(this.dialog.task);
                });

                it("re-draws the chart", function() {
                    expect(this.dialog.drawChart).toHaveBeenCalled();
                });

                it("does not hide the filter options", function() {
                   expect(this.dialog.$(".filter_options")).not.toHaveClass("hidden");
                });

                itReturnsToOriginalState();

                describe("changing the filters again and clicking 'revert'", function() {
                    beforeEach(function() {
                        this.dialog.filters.whereClause.andCallThrough();
                        this.previousWhereClause = this.dialog.filters.whereClause();
                        this.dialog.filterWizard.$(".filter input").val("even_newer").trigger("keyup");
                        expect(this.dialog.filters.whereClause()).not.toBe(this.previousWhereClause);
                    });

                    it("returns the filters to their last saved state", function() {
                        this.dialog.$("button.revert").click();
                        expect(this.dialog.filters.whereClause()).toBe(this.previousWhereClause);
                    });

                    it("can be used multiple times in a row without saving", function() {
                        this.dialog.$("button.revert").click();
                        this.dialog.filterWizard.$(".filter input").val("even_newer").trigger("keyup");
                        this.dialog.$("button.revert").click();
                        expect(this.dialog.filters.whereClause()).toBe(this.previousWhereClause);
                    })
                });
            });
        });

        function itReturnsToOriginalState() {
            it("hides the overlay", function() {
                expect(this.dialog.$('.overlay')).toHaveClass("hidden");
            });

            it("stops the spinner on the refresh button", function() {
                expect(this.dialog.$('button.refresh').isLoading()).toBeFalsy();
            });

            it("swaps out the buttons", function() {
                expect(this.dialog.$('button.refresh')).toHaveClass('hidden');
                expect(this.dialog.$('button.save')).not.toHaveClass('hidden');
                expect(this.dialog.$('button.revert')).toHaveClass('hidden');
                expect(this.dialog.$('button.stop')).toHaveClass('hidden');
                expect(this.dialog.$('button.close_dialog')).not.toHaveClass('hidden');
            });
        }

        function itShowsThatOptionsHaveChanged() {
            it("overlays some stuff on the chart", function() {
                expect(this.dialog.$('.overlay')).not.toHaveClass('hidden');
                expect(this.dialog.$(".overlay")).not.toHaveClass("disabled");
                expect(this.dialog.$('.overlay')).toContainTranslation("visualization.overlay");
            });

            it("swaps out the 'Save As..' button for a 'Refresh Visualization' button", function() {
                expect(this.dialog.$('button.refresh')).not.toHaveClass('hidden');
                expect(this.dialog.$('button.refresh')).toContainTranslation("visualization.refresh")
                expect(this.dialog.$('button.save')).toHaveClass('hidden');
            });

            it("swaps out the 'Close' button for a 'Revert' button", function() {
                expect(this.dialog.$('button.revert')).not.toHaveClass('hidden');
                expect(this.dialog.$('button.revert')).toContainTranslation("visualization.revert")
                expect(this.dialog.$('button.close_dialog')).toHaveClass('hidden');
            });
        }
    }
});
