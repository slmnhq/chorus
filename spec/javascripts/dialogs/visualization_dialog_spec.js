describe("chorus.dialogs.Visualization", function() {
    beforeEach(function() {
        stubModals();
        spyOn(chorus.Modal.prototype, "closeModal");
        this.dataset = fixtures.datasetSourceTable();
        this.chartOptions = {type: "boxplot", name: "Foo"};
        this.filters = {whereClause: function() {return "ABC";}, filterCount: function() {return 7;}};
        this.dialog = new chorus.dialogs.Visualization({model: this.dataset, chartOptions: this.chartOptions, filters: this.filters});
        this.dialog.task = fixtures.boxplotTaskWithResult();
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
                })

                it("should draw the chart", function() {
                    expect(this.dialog.drawChart).toHaveBeenCalled();
                })

                it("enables the Save Chart button", function() {
                    expect(this.dialog.$("button.save")).toBeEnabled();
                })

                it("shows the Show Data link", function() {
                    expect(this.dialog.$("a.show")).not.toHaveClass('hidden');
                })
            })

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
                    expect(this.dialog.$(".empty_data").text()).toMatchTranslation("visualization.empty_data");
                });
            })

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
        context("when the rows are empty", function() {
            beforeEach(function() {
                spyOn(this.dialog, "isValidData").andReturn(false)
                this.dialog.onExecutionComplete()
                this.dialog.render()
            });

            it("disables the Save Chart button", function() {
                expect(this.dialog.$("button.save")).toBeDisabled();
            })

            it("should not show the 'Show Data Table' link (until the chart is loaded)", function() {
                expect(this.dialog.$(".modal_controls a.show")).toHaveClass("hidden");
            });
        })

        context("when the rows are valid", function() {
            beforeEach(function() {
                this.dialog.onExecutionComplete()
                this.dialog.render();
            });

            it("should have a title", function() {
                expect(this.dialog.title).toMatchTranslation("visualization.title", {name: "Foo"});
            });

            it("should have a 'Show Data Table' link", function() {
                expect(this.dialog.$(".modal_controls a.show").text().trim()).toMatchTranslation("visualization.show_table")
            });

            it("should have a 'Hide Data Table' link", function() {
                expect(this.dialog.$(".modal_controls a.hide").text().trim()).toMatchTranslation("visualization.hide_table");
            });

            it("should have a 'Save Chart' button", function() {
                expect(this.dialog.$("button.save").text().trim()).toMatchTranslation("actions.save_chart");
            });

            it("should have a 'Close' button", function() {
                expect(this.dialog.$("button.close_dialog").text().trim()).toMatchTranslation("actions.close");
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
                    expect(this.dialog.$(".headerbar .label").text().trim()).toMatchTranslation("dataset.visualization.names.boxplot");
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
                    beforeEach(function () {
                        this.submitSpy = jasmine.createSpy("submit");
                        this.hideSpy = jasmine.createSpy("hide")

                        this.fakeForm = {
                            submit : this.submitSpy,
                            hide : this.hideSpy
                        }

                        spyOn(this.dialog, "createDownloadForm").andReturn(this.fakeForm)
                        this.dialog.$("button.save").attr("disabled", false);
                        this.dialog.$("button.save").click();
                    });

                    it("constructs a form for download", function() {
                        expect(this.dialog.createDownloadForm).toHaveBeenCalled();
                    });

                    it("hides the form", function() {
                        expect(this.hideSpy).toHaveBeenCalled();
                    })

                    it("submits the form", function() {
                        expect(this.submitSpy).toHaveBeenCalled();
                    });
                })

                describe("constructing the download form", function() {
                    beforeEach(function () {
                        this.dialog.$(".chart_area").addClass("visualization").append("<svg/>")
                        this.form = this.dialog.createDownloadForm();
                    });

                    it("has the correct action", function() {
                        expect(this.form).toHaveAttr("action", "/downloadChart.jsp")
                    })

                    it("has the correct form elements", function() {
                        expect($("input[name=svg]", this.form)).toExist();
                        expect($("input[name=chart-name]", this.form)).toHaveValue("Foo")
                        expect($("input[name=chart-type]", this.form)).toHaveValue("boxplot");
                    })
                })
            })
        })
    })

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