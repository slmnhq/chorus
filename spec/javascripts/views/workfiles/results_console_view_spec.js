describe("chorus.views.ResultsConsoleView", function() {
    beforeEach(function() {
        this.task = fixtures.task({
            checkId: "foo",
            result: {
                message: "hi there"
            }
        });
        this.view = new chorus.views.ResultsConsole({ model: this.task });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("does not display the close link", function() {
            expect(this.view.$("a.close")).not.toExist();
        });

        it("does not display the resize area", function() {
            expect(this.view.$("a.minimize")).not.toExist();
            expect(this.view.$("a.maximize")).not.toExist();
        });

        it("does not display the executing spinner", function() {
            expect(this.view.$(".right")).not.toHaveClass("executing");
        })

        it("displays save to csv file download link", function() {
            expect(this.view.$("a.download_csv")).toExist();
        })

        it("hides the bottom gutter", function() {
            expect(this.view.$(".bottom_gutter")).toHaveClass("hidden");
        });

        it("displays the default title", function() {
            expect(this.view.$("h1").text().trim()).toMatchTranslation("results_console_view.title")
        });

        context("with a title", function() {
            beforeEach(function() {
                this.view.options.titleKey = "test.mouse";
                this.view.render();
            });

            it("displays the supplied title", function() {
                expect(this.view.$("h1").text().trim()).toMatchTranslation("test.mouse")
            })
        });

        context("when the close button is enabled'", function() {
            beforeEach(function() {
                this.view.options.enableClose = true;
                this.view.render();
            });

            it("displays a close link", function() {
                expect(this.view.$("a.close")).toExist();
            });
        });

        context("when the resize area is enabled", function() {
            beforeEach(function() {
                this.view.options.enableResize = true;
                this.view.render();
            });

            it("hides the minimize and maximize links", function() {
                expect(this.view.$("a.minimize")).toHaveClass('hidden')
                expect(this.view.$("a.maximize")).toHaveClass('hidden')
            });
        });

        context("when the expander arrow should be hidden", function() {
            beforeEach(function() {
                this.view.options.enableExpander = false;
                this.view.render();
            });

            it("hides the expander", function() {
                expect(this.view.$(".expander_button")).not.toExist();
            });
        })
    })

    describe("event handling", function() {
        beforeEach(function() {
            this.view.options.enableResize = true;
            this.view.options.enableExpander = true;
            this.view.render();
        });

        describe("clicking the close link", function() {
            beforeEach(function() {
                this.view.options.enableClose = true;
                this.view.render();
                this.view.$(".controls").removeClass("hidden")

                spyOn(chorus.PageEvents, "broadcast");
                this.view.$("a.close").click();
            });

            it("broadcasts action:closePreview", function() {
                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("action:closePreview");
            });

            it("hides the control section", function() {
                expect(this.view.$(".controls")).toHaveClass("hidden");
            });
        });

        describe("file:executionStarted", function() {
            beforeEach(function() {
                this.clock = this.useFakeTimers();
                spyOn(window, "clearInterval");
                spyOn(this.view, "closeError").andCallThrough();

                chorus.PageEvents.broadcast("file:executionStarted");
            });

            it("sets the executing class", function() {
                expect(this.view.$(".right")).toHaveClass("executing");
            });

            it("hides the control section", function() {
                expect(this.view.$(".controls")).toHaveClass("hidden");
            });

            it("sets a delay to start a spinner", function() {
                expect(this.view.$(".spinner")).toHaveClass("hidden");
                this.clock.tick(300);
                expect(this.view.$(".spinner")).not.toHaveClass("hidden");
            });

            it("updates the time", function() {
                this.clock.tick(1000);
                expect(this.view.$(".elapsed_time").text().trim()).toMatchTranslation("results_console_view.elapsed", { sec: 1 });
                this.clock.tick(10000);
                expect(this.view.$(".elapsed_time").text().trim()).toMatchTranslation("results_console_view.elapsed", { sec: 11 });
            });

            it("shows the execution bar", function() {
                expect(this.view.$(".execution")).not.toHaveClass("hidden");
            });


            it("closes the errors", function() {
                expect(this.view.closeError).toHaveBeenCalled();
            });

            describe("cancelling the execution", function() {
                context("when the spinner has not yet been started", function() {
                    beforeEach(function() {
                        this.view.$(".cancel").click();
                        chorus.PageEvents.broadcast("file:executionFailed");
                    })

                    it("cancels the execution", function() {
                        var update = this.server.lastUpdate();
                        expect(update).toBeDefined();
                        expect(update.requestBody).toContain("action=cancel")
                    })

                    itRemovesExecutionUI(true);
                })

                context("when the spinner has been started", function() {
                    beforeEach(function() {
                        delete this.view.elapsedTimer;
                        this.view.$(".cancel").click();
                        chorus.PageEvents.broadcast("file:executionFailed");
                    })

                    it("cancels the execution", function() {
                        var update = this.server.lastUpdate();
                        expect(update).toBeDefined();
                        expect(update.requestBody).toContain("action=cancel")
                    })

                    itRemovesExecutionUI(false);
                })
            })

            describe("when the execution is completed", function() {
                context("and the task does not have a result message", function() {
                    beforeEach(function() {
                        this.task = fixtures.task({ result: null });
                        this.view = new chorus.views.ResultsConsole({ model: this.task });
                        this.view.execute(this.task);
                        chorus.PageEvents.broadcast("file:executionSucceeded", this.task);
                    });

                    it("does not show the 'view details' link", function() {
                        expect(this.view.$(".execution a.view_details")).not.toExist();
                    });
                });

                context("and the task does not have results", function() {
                    beforeEach(function() {
                        this.task = fixtures.taskWithoutResults();
                        this.view = new chorus.views.ResultsConsole({ model: this.task });
                        this.view.render();
                        this.view.execute(this.task);
                        chorus.PageEvents.broadcast("file:executionSucceeded", this.task);
                    });

                    it("collapses the result table", function() {
                        expect(this.view.$(".controls")).toHaveClass("collapsed");
                        expect(this.view.$('.result_table')).toHaveClass("collapsed");
                        expect(this.view.$('.result_table')).not.toHaveClass("minimized");
                        expect(this.view.$('.result_table')).not.toHaveClass("maximized");
                        expect(this.view.$('.data_table').css("height")).toBe("0px");
                    });
                });

                context("when the spinner has not yet been started", function() {
                    beforeEach(function() {
                        this.task = fixtures.taskWithResult();
                        chorus.PageEvents.broadcast("file:executionSucceeded", this.task);
                    })

                    itRemovesExecutionUI(true);
                    itShowsExecutionResults();
                });

                context("when the spinner has been started", function() {
                    beforeEach(function() {
                        delete this.view.elapsedTimer;
                        this.task = fixtures.taskWithResult();
                        chorus.PageEvents.broadcast("file:executionSucceeded", this.task);
                    })

                    itRemovesExecutionUI(false);
                    itShowsExecutionResults();
                })

                it("has a link to display the execution message", function() {
                    expect(this.view.$(".execution .view_details").text()).toMatchTranslation("actions.view_details");
                });

                describe("clicking the execution message link", function() {
                    it("launches an execution message alert", function() {
                        var fakeModal = stubModals();
                        this.view.$(".execution a.view_details").click();

                        var alert = fakeModal.lastModal();
                        expect(alert).toBeA(chorus.alerts.ExecutionMessage);
                        expect($(alert.el)).toContainText("hi there");
                    });
                });

                context("and there was an execution error", function() {
                    beforeEach(function() {
                        this.task = fixtures.taskWithErrors();
                        chorus.PageEvents.broadcast("file:executionFailed", this.task);
                    });

                    it("should show the error header", function() {
                        expect(this.view.$('.sql_errors')).not.toHaveClass('hidden');
                    })

                    it("should show 'View Details' and 'Close' links", function() {
                        expect(this.view.$('.sql_errors .view_details')).toExist();
                        expect(this.view.$('.sql_errors .close_errors')).toExist();
                    })

                    it("should hide the execution content area", function() {
                        expect(this.view.$(".result_table")).toHaveClass("hidden");
                        expect(this.view.$(".bottom_gutter")).toHaveClass("hidden");
                        expect(this.view.$(".execution")).toHaveClass("hidden");
                    });

                    describe("clicking on the close button", function() {
                        beforeEach(function() {
                            this.view.$(".close_errors").click();
                        })

                        it("should hide the sql_errors content", function() {
                            expect(this.view.$(".sql_errors")).toHaveClass("hidden");
                        });

                        it("should show the execution content area", function() {
                            expect(this.view.$(".sql_errors")).toHaveClass("hidden");
                        });
                    });

                    context("when the sql is executed again without errors", function() {
                        beforeEach(function() {
                            this.task = fixtures.taskWithResult();
                            chorus.PageEvents.broadcast("file:executionSucceeded", this.task);
                        })

                        it("should show the data table", function() {
                            expect(this.view.$(".result_table")).not.toHaveClass("hidden");
                            expect(this.view.$(".bottom_gutter")).not.toHaveClass("hidden");
                        });
                    })

                    describe("clicking on view details", function() {
                        it("should open an execution message alert", function() {
                            this.modalSpy = stubModals();
                            this.view.$(".view_details").click();
                            expect(this.modalSpy).toHaveModal(chorus.alerts.ExecutionMessage);
                        });
                    });
                });

                describe("starting another execution", function() {
                    beforeEach(function() {
                        this.task = fixtures.task();
                        this.view.execute(this.task);
                        chorus.PageEvents.broadcast("file:executionSucceeded", this.task);
                        chorus.PageEvents.broadcast("file:executionStarted")
                    });

                    it("hides the gutter", function() {
                        expect(this.view.$(".bottom_gutter")).toHaveClass("hidden");
                    });

                    it("clears out any data that is already in the table", function() {
                        expect(this.view.$(".result_table")).toHaveHtml("");
                    });
                });
            });

            function itRemovesExecutionUI(shouldCancelTimers) {
                it("removes the executing class", function() {
                    expect(this.view.$(".right")).not.toHaveClass("executing");
                })

                it("hides the spinner", function() {
                    expect(this.view.$(".spinner")).toHaveClass("hidden");
                    expect(this.view.$(".spinner").isLoading()).toBeFalsy();
                })

                if (shouldCancelTimers) {
                    it("stops updating the elapsed time", function() {
                        expect(window.clearInterval).toHaveBeenCalled();
                    })
                }

                it("clears timer ids", function() {
                    expect(this.view.elapsedTimer).toBeUndefined();
                })
            }

            function itShowsExecutionResults() {

                it("renders a task data table with the given task", function() {
                    expect(this.view.dataTable).toBeA(chorus.views.TaskDataTable);
                    expect(this.view.dataTable.model).toBe(this.task);
                    expect($(this.view.el)).toContain(this.view.dataTable.el);
                });

                it("displays the result table", function() {
                    expect(this.view.$('.result_table')).not.toHaveClass("hidden");
                });

                it("renders only one data table", function() {
                    expect(this.view.$(".result_table .data_table").length).toBe(1);
                });

                it("shows the control section", function() {
                    expect(this.view.$(".controls")).not.toHaveClass("hidden");
                });

                context("when another execution completed event occurs", function() {
                    beforeEach(function() {
                        chorus.PageEvents.broadcast("file:executionSucceeded", fixtures.taskWithResult());
                    });

                    it("still renders only one data table", function() {
                        expect(this.view.$(".result_table .data_table").length).toBe(1);
                    });
                });

                it("changes the state of the result table to 'minimized'", function() {
                    expect(this.view.$('.result_table')).not.toHaveClass("collapsed");
                    expect(this.view.$('.result_table')).toHaveClass("minimized");
                    expect(this.view.$('.result_table')).not.toHaveClass("maximized");
                });

                it("renders the maximize link", function() {
                    expect(this.view.$("a.maximize")).not.toHaveClass("hidden");
                    expect(this.view.$("a.minimize")).toHaveClass("hidden");
                });

                it("shows the bottom gutter (with the expander button)", function() {
                    expect(this.view.$(".bottom_gutter")).not.toHaveClass("hidden");
                });

                specify("the expander button arrow points up", function() {
                    expect(this.view.$(".arrow")).toHaveClass("up");
                    expect(this.view.$(".arrow")).not.toHaveClass("down");
                });

                describe("clicking the maximize link", function() {
                    beforeEach(function() {
                        spyOn(this.view, "getDesiredDataTableHeight").andReturn(777);
                        spyOn(this.view, "recalculateScrolling");
                        this.view.$("a.maximize").click();
                    });

                    it("hides the maximize link and shows the minimize link", function() {
                        expect(this.view.$("a.maximize")).toHaveClass("hidden");
                        expect(this.view.$("a.minimize")).not.toHaveClass("hidden");
                    });

                    it("changes the state of the result table to 'minimized'", function() {
                        expect(this.view.$('.result_table')).not.toHaveClass("collapsed");
                        expect(this.view.$('.result_table')).not.toHaveClass("minimized");
                        expect(this.view.$('.result_table')).toHaveClass("maximized");
                    });

                    it("recalculates scrolling", function() {
                        expect(this.view.recalculateScrolling).toHaveBeenCalled();
                    })

                    specify("the expander button arrow points up", function() {
                        expect(this.view.$(".arrow")).toHaveClass("up");
                        expect(this.view.$(".arrow")).not.toHaveClass("down");
                    });

                    it("sets .data_table height to use the full viewport", function() {
                        expect(this.view.$(".data_table").css("height")).toBe("777px");
                    });

                    itCanExpandAndCollapseTheResults("maximized", "minimized");

                    describe("clicking the minimize link", function() {
                        beforeEach(function() {
                            this.view.recalculateScrolling.reset();
                            this.view.$("a.minimize").click();
                        });

                        it("hides the minimize link and shows the maximize link", function() {
                            expect(this.view.$("a.minimize")).toHaveClass("hidden");
                            expect(this.view.$("a.maximize")).not.toHaveClass("hidden");
                        });

                        it("changes the state of the result table to 'minimized'", function() {
                            expect(this.view.$('.result_table')).not.toHaveClass("collapsed");
                            expect(this.view.$('.result_table')).toHaveClass("minimized");
                            expect(this.view.$('.result_table')).not.toHaveClass("maximized");
                        });

                        it("recalculates scrolling", function() {
                            expect(this.view.recalculateScrolling).toHaveBeenCalled();
                        })


                        specify("the expander button arrow points up", function() {
                            expect(this.view.$(".arrow")).toHaveClass("up");
                            expect(this.view.$(".arrow")).not.toHaveClass("down");
                        });

                        it("does not keep the maxmized height", function() {
                            expect(this.view.$(".data_table").css("height")).not.toBe("777px");
                        });

                    })
                });

                describe("getDesiredDataTableHeight", function() {
                    it("incorporates the footerSize passed to the view as a function", function() {
                        var originalSize = this.view.getDesiredDataTableHeight();
                        this.view.options.footerSize = function() {
                            return 10;
                        }
                        expect(this.view.getDesiredDataTableHeight()).toBe(originalSize - 10);
                    });
                });

                describe("clicking the download link", function() {
                    context("with the show download dialog option", function() {
                        beforeEach(function() {
                            this.modalSpy = stubModals();
                            spyOn($, "download");
                            this.view.showDownloadDialog = true;
                            this.view.tabularDataset = new chorus.models.TabularData();
                            this.view.$("a.download_csv").click();
                        });

                        it("should launch the dialog", function() {
                            expect(this.modalSpy).toHaveModal(chorus.dialogs.DatasetDownload);
                        });

                        it("should not have called $.download", function() {
                            expect($.download).not.toHaveBeenCalled();
                        });

                        it("should have a page model for the dataset download dialog", function() {
                            expect(this.modalSpy.lastModal().pageModel).toBeA(chorus.models.TabularData);
                        });
                    });

                    context("without the show download dialog option", function() {
                        beforeEach(function() {
                            spyOn($, "download");
                            this.view.showDownloadDialog = false;
                            this.view.$("a.download_csv").click();
                        });

                        it("starts the file download", function() {
                            expect($.download).toHaveBeenCalledWith("/edc/data/cvsResultDownload",
                            {
                                columnData: this.view.resource.getColumns(),
                                rowsData: this.view.resource.getRows(),
                                datasetName: this.view.resource.name()
                            }
                            , "post");
                        });
                    });
                });
            }

            function itCanExpandAndCollapseTheResults(tableShouldHaveClass, tableShouldNotHaveClass) {
                describe("clicking the expander arrow when it points up", function() {
                    beforeEach(function() {
                        this.view.$(".arrow").click();
                    })

                    it("collapses the result table", function() {
                        expect(this.view.$(".controls")).toHaveClass("collapsed");
                        expect(this.view.$('.result_table')).toHaveClass("collapsed");
                        expect(this.view.$('.result_table')).not.toHaveClass("minimized");
                        expect(this.view.$('.result_table')).not.toHaveClass("maximized");
                        expect(this.view.$('.data_table').css("height")).toBe("0px");
                    })

                    it("makes the arrow point down", function() {
                        expect(this.view.$(".arrow")).not.toHaveClass("up");
                        expect(this.view.$(".arrow")).toHaveClass("down");
                        expect(this.view.$(".bottom_gutter")).not.toHaveClass("hidden");
                    })

                    it("hides the minimize/maximize links", function() {
                        expect(this.view.$("a.minimize")).toHaveClass("hidden");
                        expect(this.view.$("a.maximize")).toHaveClass("hidden");
                    })

                    describe("clicking the arrow when it points down", function() {
                        beforeEach(function() {
                            this.view.$(".arrow").click();
                        })
                        it("restores the result table", function() {
                            expect(this.view.$(".controls")).not.toHaveClass("collapsed");
                            expect(this.view.$('.result_table')).not.toHaveClass("collapsed");
                            expect(this.view.$('.result_table')).toHaveClass(tableShouldHaveClass);
                            expect(this.view.$('.result_table')).not.toHaveClass(tableShouldNotHaveClass);
                        })

                        it("makes the arrow point up", function() {
                            expect(this.view.$(".arrow")).toHaveClass("up");
                            expect(this.view.$(".arrow")).not.toHaveClass("down");
                            expect(this.view.$(".bottom_gutter")).not.toHaveClass("hidden");
                        })

                        it("restores the minimize/maximize link", function() {
                            var selector1 = "." + tableShouldHaveClass.slice(0, -1);
                            var selector2 = "." + tableShouldNotHaveClass.slice(0, -1);
                            expect(this.view.$(selector1)).toHaveClass("hidden")
                            expect(this.view.$(selector2)).not.toHaveClass("hidden")
                        })
                    });
                })
            }
        });

        describe("#beforeNavigateAway", function() {
            beforeEach(function() {
                spyOn(this.task, "cancel").andCallThrough();
                this.view.beforeNavigateAway();
            });

            it("cancels the task", function() {
                expect(this.task.cancel).toHaveBeenCalled();
            });
        });
    });

    describe("#execute", function() {
        beforeEach(function() {
            this.executionModel = new chorus.models.Task();
            spyOn(this.executionModel, 'url').andReturn('super_great_thing');
            spyOn(this.view, 'executionStarted');
            spyOn(this.view, 'executionSucceeded');
            spyOn(this.view, 'executionFailed');
            spyOn(this.executionModel, 'save').andCallThrough();
            this.view.execute(this.executionModel);
            this.view.render();
        });

        it("saves the executionModel", function() {
            expect(this.executionModel.save).toHaveBeenCalled();
        });

        it("calls executionStarted", function() {
            expect(this.view.executionStarted).toHaveBeenCalled();
        });

        context("when the task was successfully executed previously", function() {
            beforeEach(function() {
                this.task = fixtures.task();
                this.task.loaded = true;
                this.view.execute(this.task);
            });

            it("does not show the data table", function() {
                expect(this.view.executionSucceeded).not.toHaveBeenCalled();
            });
        });

        context("when execution is successful", function() {
            context("when save request returns successfully", function() {
                beforeEach(function() {
                    this.view.model.trigger("saved");
                });

                it("calls executionSucceeded", function() {
                    expect(this.view.executionSucceeded).toHaveBeenCalledWith(this.executionModel);
                });
            });
        });

        context("when execution fails", function() {
            beforeEach(function() {
                this.server.lastCreateFor(this.executionModel).fail([
                    {message: "broke!"}
                ]);
            });

            it("calls executionFailed", function() {
                expect(this.view.executionFailed).toHaveBeenCalled();
                expect(this.view.executionFailed.mostRecentCall.args[0]).toBe(this.executionModel);
            });
        });
    });
})
