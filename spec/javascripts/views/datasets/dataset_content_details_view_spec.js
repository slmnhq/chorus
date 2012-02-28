describe("chorus.views.DatasetContentDetails", function() {
    describe("#render", function() {
        beforeEach(function() {
            this.qtipMenu = stubQtip();
            this.tabularData = fixtures.datasetSourceTable();
            this.collection = this.tabularData.columns([fixtures.databaseColumn(), fixtures.databaseColumn()]);

            this.view = new chorus.views.DatasetContentDetails({tabularData: this.tabularData, collection: this.collection});
            spyOn(this.view.filterWizardView, 'resetFilters').andCallThrough();
            this.server.completeFetchFor(this.tabularData.statistics(), fixtures.datasetStatisticsView());
            this.view.render();
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

        context("when in Edit Chorus View mode", function() {
            beforeEach(function() {
                this.view.options.inEditChorusView = true;
                this.view.render();
            });
            it("shows the definition and informational bar for Edit Chorus View", function() {
                expect(this.view.$(".edit_chorus_view")).not.toHaveClass("hidden");
                expect(this.view.$(".edit_chorus_view_info")).not.toHaveClass("hidden");
            })
        })

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
                        var tabularData = fixtures.datasetSourceTable()
                        this.view = new chorus.views.DatasetContentDetails({tabularData: tabularData, collection: this.collection});
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
                    var tabularData = fixtures.datasetChorusView();
                    this.view = new chorus.views.DatasetContentDetails({tabularData: tabularData, collection: this.collection});
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
                            expect(this.view.resultsConsole.execute).toHaveBeenCalledWith(this.view.tabularData.preview());
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
                            expect(this.view.resultsConsole.execute).toHaveBeenCalledWith(this.view.tabularData.preview(this.view.options.inEditChorusView), true);
                        });
                    });
                })
            })

        })

        describe("definition bar", function() {
            it("renders", function() {
                expect(this.view.$(".definition")).toExist();
            })

            it("renders the 'Visualize' button", function() {
                expect(this.view.$("button.visualize")).toExist();
                expect(this.view.$("button.visualize").text()).toMatchTranslation("dataset.content_details.visualize");
            })

            it("doesn't render the chorus view info bar", function() {
                expect(this.view.$(".chorus_view_info")).toHaveClass("hidden");
            });

            context("and the visualize button is clicked", function() {
                beforeEach(function() {
                    this.view.filterWizardView.resetFilters.reset();
                    this.visualizeSpy = spyOnEvent(this.view, "transform:sidebar");
                    this.view.$("button.visualize").click();
                })

                it("selects the first chart type", function() {
                    expect(this.view.$('.create_chart .chart_icon:eq(0)')).toHaveClass('selected');
                });

                it("triggers the transform:sidebar event for the first chart type", function() {
                    var chartType = this.view.$('.create_chart .chart_icon:eq(0)').data('chart_type');
                    expect("transform:sidebar").toHaveBeenTriggeredOn(this.view, [chartType]);
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

                context("and cancel is clicked", function() {
                    beforeEach(function() {
                        spyOn(chorus.PageEvents, 'broadcast').andCallThrough();
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

                    it("triggers the cancel:sidebar event for the chart type", function() {
                        var chartType = this.view.$('.create_chart .chart_icon:eq(0)').data('chart_type');
                        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith('cancel:sidebar', chartType);
                    })
                })

                context("and a chart type is clicked", function() {
                    beforeEach(function() {
                        this.visualizeSpy.reset();
                        var chartIcon = this.view.$('.create_chart .chart_icon:eq(3)').click();
                        this.firstChartType = chartIcon.data('chart_type');
                    });

                    it("selects that icon", function() {
                        expect(this.view.$('.create_chart .chart_icon.' + this.firstChartType)).toHaveClass('selected');
                    });

                    it("triggers the transform:sidebar event for the chart type", function() {
                        expect("transform:sidebar").toHaveBeenTriggeredOn(this.view, [this.firstChartType]);
                    })

                    it("shows the title for that chart type", function() {
                        var chartType =
                            expect(this.view.$('.title.' + this.firstChartType)).not.toHaveClass('hidden');
                    })

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
                        })
                    })
                })
            })

            context("and the derive a chorus view button is clicked", function() {
                beforeEach(function() {
                    this.view.filterWizardView.resetFilters.reset();
                    this.chorusViewSpy = spyOnEvent(this.view, "transform:sidebar");
                    this.view.$('button.derive').click();
                })
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

                    it("should trigger the column:select_all event", function() {
                        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("column:select_all");
                    });
                });

                describe("clicking 'Select None'", function() {
                    beforeEach(function() {
                        spyOn(chorus.PageEvents, "broadcast");
                        this.view.$(".select_none").click();
                    })

                    it("should trigger the column:select_none event", function() {
                        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("column:select_none");
                    });
                });

                describe("and the cancel link is clicked", function() {
                    beforeEach(function() {
                        spyOn(chorus.PageEvents, "broadcast");
                        this.cancelSpy = spyOnEvent(this.view, "cancel:sidebar");
                        this.view.$(".create_chorus_view .cancel").click();
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

                    it("triggers 'cancel:sidebar'", function() {
                        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith('cancel:sidebar', 'chorus_view');
                    })
                });
            })

            context("when the tabularData is not a chorus view", function() {
                it("should not display the edit chorus view button", function() {
                    expect(this.view.$("button.edit")).not.toExist();
                })
            })

            context("when the tabularData is a chorus view", function() {
                beforeEach(function() {
                    var tabularData = fixtures.datasetChorusView();
                    tabularData.initialQuery = "select * from abc";
                    this.view = new chorus.views.DatasetContentDetails({tabularData: tabularData, collection: this.collection});
                    this.server.completeFetchFor(tabularData.statistics());
                    this.view.render();
                });

                it("does not display the derive chorus view button", function() {
                    expect(this.view.$("button.derive")).not.toExist();
                })

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
            })
        })

        describe("column count bar", function() {
            it("renders", function() {
                expect(this.view.$(".column_count")).toExist();
            })

            it("renders the column count", function() {
                expect(this.view.$(".column_count .count").text().trim()).toMatchTranslation("dataset.column_count", { count: this.collection.models.length })
            })
        })

        describe("sql errors bar", function() {
            it("renders, hidden", function() {
                expect(this.view.$(".sql_errors")).toHaveClass("hidden");
            })

            it("isn't cleared by clearErrors", function() {
                this.view.clearErrors();
                expect(this.view.$(".sql_errors").html()).not.toBe("");
            })

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
                        stubModals()
                        spyOn(chorus.Modal.prototype, 'launchModal');
                        this.view.$('.view_error_details').click();
                    });

                    it("launches the alertClass with the task as the model", function() {
                        expect(this.alertClass.prototype.launchModal).toHaveBeenCalled();
                        $("#jasmine_content").append(this.view.el);
                        expect(this.alertClass.prototype.launchModal.mostRecentCall.object).toBeA(this.alertClass);
                        expect(this.alertClass.prototype.launchModal.mostRecentCall.object.model).toBe(this.taskWithErrors);
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


            })
        })
    })
});
