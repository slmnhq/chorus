describe("chorus.dialogs.Visualization", function() {
    beforeEach(function() {
        stubModals();
        spyOn(chorus.Modal.prototype, "closeModal");
        this.dataset = fixtures.datasetSourceTable();
        this.chartOptions = {type: "boxplot", name: "Foo"};
        this.filters = {whereClause: function() {return "ABC";}, filterCount: function(){return 7;}};
        this.dialog = new chorus.dialogs.Visualization({model: this.dataset, chartOptions: this.chartOptions, filters: this.filters});
        this.dialog.task = fixtures.taskWithErrors();
    });

    describe("#initialization", function() {
        beforeEach(function() {
            spyOnEvent(this.dialog.chartData, "file:executionCompleted");
        });

        describe("when the save completes", function() {
            beforeEach(function() {
                spyOn(chorus.views.visualizations, "Boxplot").andReturn(stubView())
                spyOn(this.dialog, "drawChart").andCallThrough()
                this.dialog.render();
                this.dialog.onExecutionComplete();
            });

            it("should trigger file:executionCompleted on the result console", function() {
                expect("file:executionCompleted").toHaveBeenTriggeredOn(this.dialog.chartData);
            });

            it("should draw the chart", function() {
                expect(this.dialog.drawChart).toHaveBeenCalled();
            })

            it("enables the Save Chart button", function() {
                expect(this.dialog.$("button.save")).toBeEnabled();
            })
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
        });
        
        it("should have a title", function() {
            expect(this.dialog.title).toMatchTranslation("visualization.title", {name: "Foo"});
        });

        it("should have a 'Show Data Table' link", function() {
            expect(this.dialog.$(".dialog_controls a.show").text().trim()).toMatchTranslation("visualization.show_table")
        });

        it("should have a 'Hide Data Table' link", function() {
            expect(this.dialog.$(".dialog_controls a.hide").text().trim()).toMatchTranslation("visualization.hide_table");
        });

        it("should have a 'Save Chart' button", function() {
            expect(this.dialog.$("button.save").text().trim()).toMatchTranslation("actions.save_chart");
        });

        it("should have a 'Close' button", function() {
            expect(this.dialog.$("button.close_dialog").text().trim()).toMatchTranslation("actions.close");
        });

        it("disables the Save Chart button", function() {
            expect(this.dialog.$("button.save")).toBeDisabled();
        })

        it("has a link to filters with the filter count", function() {
            expect(this.dialog.$("a.filter").text()).toMatchTranslation("visualization.show_filters", {count: 7});
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

            it("should show a 'Show Data Table' link", function() {
                expect(this.dialog.$(".dialog_controls a.show")).not.toHaveClass("hidden");
            });

            it("should hide the 'Hide Data Table' link", function() {
                expect(this.dialog.$(".dialog_controls a.hide")).toHaveClass("hidden");
            });
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

    describe("show and hide tabular data", function() {
        beforeEach(function() {
            this.dialog.render();
        });
        
        describe("clicking on the 'Show Data Table' link", function() {
            beforeEach(function() {
                this.dialog.$(".dialog_controls a.show").click();
            });

            it("should show the data table", function() {
                expect(this.dialog.$(".results_console")).not.toHaveClass("hidden");
            })

            it("should hide the show table link", function() {
                expect(this.dialog.$(".dialog_controls a.show")).toHaveClass("hidden");
            })

            it("should show the hide table link", function() {
                expect(this.dialog.$(".dialog_controls a.hide")).not.toHaveClass("hidden");
            })

            describe("clicking on the 'Hide Chart Data' link", function() {
                beforeEach(function() {
                    this.dialog.$(".dialog_controls a.hide").click();
                });

                it("should hide the data table", function() {
                    expect(this.dialog.$(".results_console")).toHaveClass("hidden");
                });

                it("should show the 'Show Data Table' link", function() {
                    expect(this.dialog.$(".dialog_controls a.show")).not.toHaveClass("hidden");
                });

                it("should hide the 'Hide Data Table' link", function() {
                    expect(this.dialog.$(".dialog_controls a.hide")).toHaveClass("hidden");
                });
            });
        });
    });
});