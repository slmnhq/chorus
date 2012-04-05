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

        this.filters = new chorus.views.DatasetFilterWizard({columnSet: this.columns});
        spyOn(this.filters, "filterStrings").andReturn(["A", "B"]);

        this.dialog = new chorus.dialogs.Visualization({model: this.dataset, chartOptions: this.chartOptions, filters: this.filters});
        this.dialog.task = fixtures.boxplotTaskWithResult();

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
                    this.dialog.render();
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
                    expect(this.filters.filterCount()).toBe(2);
                    expect(this.dialog.$("a.show_options")).toContainTranslation("visualization.show_options", {count: 2});
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
                this.dialog = new chorus.dialogs.Visualization({model: this.dataset, chartOptions: this.chartOptions, filters: this.filters});
                this.dialog.task = fixtures.boxplotTaskWithResult();
            })

            it("should be valid", function() {
                expect(this.dialog.isValidData()).toBeTruthy()
            })
        })

        describe("it has no rows", function() {
            beforeEach(function() {
                this.chartOptions["type"] = "histogram";
                this.dialog = new chorus.dialogs.Visualization({model: this.dataset, chartOptions: this.chartOptions, filters: this.filters});
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

        context("clicking on the 'Show Options' link", function() {
            beforeEach(function() {
                this.dialog.$("a.show_options").click();
            });

            it("shows the filter section", function() {
                expect(this.dialog.$(".filter_options")).not.toHaveClass("hidden");
            });

            it("renders the correct number of filters", function() {
                // Really add filters to dialog - not a stub
                this.dialog.filters.addFilter()
                this.dialog.filters.addFilter()
                this.dialog.filters.render();
                this.dialog.filters.$(".filter input").val("AA");
                this.dialog.render();

                expect(this.dialog.$(".filter_options li").length).toBe(2);
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
});
