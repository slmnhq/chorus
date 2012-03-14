describe("chorus.views.ResultsConsoleView", function() {
    beforeEach(function() {
        this.model = fixtures.task({
            checkId: "foo",
            result: {
                message: "hi there"
            }
        });
        this.view = new chorus.views.ResultsConsole({model: this.model});
        this.timerId = 1;
        spyOn(_, "delay").andReturn(this.timerId++)
    })

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        })

        it("does not display the close link", function() {
            expect(this.view.$("a.close")).not.toExist();
        });

        it("displays the executing spinner", function() {
            expect(this.view.$(".right")).not.toHaveClass("executing");
        })

        it("hides the minimize and maximize links", function() {
            expect(this.view.$("a.minimize")).toHaveClass('hidden')
            expect(this.view.$("a.maximize")).toHaveClass('hidden')
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

        context("when the expander arrow should be hidden", function() {
            beforeEach(function() {
                this.view.options.hideExpander = true;
                this.view.render();
            });

            it("hides the expander", function() {
                expect(this.view.$(".expander_button")).not.toExist();
            });

        })
    })

    describe("event handling", function() {
        beforeEach(function() {
            this.view.render();
        })

        describe("clicking the close link", function() {
            beforeEach(function() {
                this.view.options.enableClose = true;
                this.view.render();

                spyOn(chorus.PageEvents, "broadcast");
                this.view.$("a.close").click();
            });

            it("broadcasts action:closePreview", function() {
                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("action:closePreview");
            });
        });

        describe("file:executionStarted", function() {
            beforeEach(function() {
                spyOn(window, "clearTimeout");

                chorus.PageEvents.broadcast("file:executionStarted")
            })

            it("sets the executing class", function() {
                expect(this.view.$(".right")).toHaveClass("executing");
            });

            it("hides the control section", function() {
                expect(this.view.$(".controls")).toHaveClass("hidden");
            });

            it("sets a delay to start a spinner", function() {
                expect(_.delay).toHaveBeenCalledWith(jasmine.any(Function), 250);
            })

            it("saves the spinner timer id", function() {
                expect(this.view.spinnerTimer).toBeDefined();
            })

            it("starts tracking execution time", function() {
                expect(_.delay).toHaveBeenCalledWith(jasmine.any(Function), 1000);
            })

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
                        delete this.view.spinnerTimer;
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
                        delete this.view.spinnerTimer;
                        delete this.view.elapsedTimer;
                        this.task = fixtures.taskWithResult();
                        chorus.PageEvents.broadcast("file:executionSucceeded", this.task);
                    })

                    itRemovesExecutionUI(false);
                    itShowsExecutionResults();
                })

                it("displays the result message", function() {
                    expect(this.view.$(".message").text().trim()).toBe("hi there")
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

                    it("does not display the result message", function() {
                        expect(this.view.$(".message")).toBeEmpty();
                    });

                    it("should hide the execution content area", function() {
                        expect(this.view.$(".result_content")).toHaveClass("hidden");
                    });

                    describe("clicking on the close button", function() {
                        beforeEach(function() {
                            this.view.$(".close_errors").click();
                        })

                        it("should hide the sql_errors content", function() {
                            expect(this.view.$(".sql_errors")).toHaveClass("hidden");
                        });
                    });

                    context("when the sql is executed again without errors", function() {
                        beforeEach(function() {
                            this.task = fixtures.taskWithResult();
                            chorus.PageEvents.broadcast("file:executionSucceeded", this.task);
                        })

                        it("should show the execution content area", function() {
                            expect(this.view.$(".result_content")).not.toHaveClass("hidden");
                        });
                    })

                    describe("clicking on view details", function() {
                        beforeEach(function() {
                            spyOn(chorus.Modal.prototype, "launchModal");
                            this.view.$(".view_details").click();
                        });

                        it("should open a dialog", function() {
                            expect(chorus.Modal.prototype.launchModal).toHaveBeenCalled();
                        });
                    });
                });
            })

            function itRemovesExecutionUI(shouldCancelTimers) {
                it("removes the executing class", function() {
                    expect(this.view.$(".right")).not.toHaveClass("executing");
                })

                it("stops the spinner", function() {
                    expect(this.view.$(".spinner").isLoading()).toBeFalsy();
                })

                if (shouldCancelTimers) {
                    it("cancels the spinner and elapsed time timers", function() {
                        expect(window.clearTimeout.callCount >= 2).toBeTruthy();
                    })
                }

                it("clears timer ids", function() {
                    expect(this.view.spinnerTimer).toBeUndefined();
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

                itCanExpandAndCollapseTheResults("minimized", "maximized");
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
        })
    })

    describe("#startSpinner", function() {
        beforeEach(function() {
            this.view.render();
            this.view.spinnerTimer = 22;
            this.view.startSpinner();
        })

        it("deletes the timer id", function() {
            expect(this.view.spinnerTimer).toBeUndefined();
        })

        it("starts the spinner", function() {
            expect(this.view.$(".spinner").isLoading()).toBeTruthy();
        })
    })

    describe("#incrementElapsedTime", function() {
        beforeEach(function() {
            this.view.render();
            this.view.elapsedTimer = 22;
            this.view.elapsedTime = 40;
            this.view.incrementElapsedTime();
        })

        it("updates execution time", function() {
            expect(this.view.$(".elapsed_time").text().trim()).toMatchTranslation("results_console_view.elapsed", { sec: 41 })
        })

        it("reschedules itself", function() {
            expect(_.delay).toHaveBeenCalledWith(jasmine.any(Function), 1000);
        })
    })

    describe("#execute", function() {
        beforeEach(function() {
            this.executionModel = new chorus.models.Base();
            spyOn(this.executionModel, 'url').andReturn('super_great_thing');
            spyOn(this.view, 'executionStarted');
            spyOn(this.view, 'executionSucceeded');
            spyOn(this.view, 'executionFailed');
            spyOn(this.executionModel, 'fetchIfNotLoaded').andCallThrough();
            this.view.execute(this.executionModel);
        });

        it("fetches the executionModel", function() {
            expect(this.executionModel.fetchIfNotLoaded).toHaveBeenCalled();
        });

        it("calls executionStarted", function() {
            expect(this.view.executionStarted).toHaveBeenCalled();
        });

        context("when isPostRequest is true", function() {
            beforeEach(function() {
                this.executionModel.fetchIfNotLoaded.reset();
                spyOn(this.executionModel, "save").andCallThrough();
                this.view.execute(this.executionModel, true);
            });
            it("should make a post request", function() {
                expect(this.executionModel.save).toHaveBeenCalled();
                expect(this.executionModel.fetchIfNotLoaded).not.toHaveBeenCalled();
            })
        })

        context("when execution is successful", function() {
            context("when fetch returns successfully" , function() {
                beforeEach(function() {
                    this.server.completeFetchFor(this.executionModel);
                });

                it("calls executionSucceeded", function() {
                    expect(this.view.executionSucceeded).toHaveBeenCalledWith(this.executionModel);
                });
            })

            context("when save request returns successfully", function() {
                beforeEach(function() {
                    this.view.model.trigger("saved");
                });

                it("calls executionSucceeded", function() {
                    expect(this.view.executionSucceeded).toHaveBeenCalledWith(this.executionModel);
                });
            })

        });

        context("when execution fails", function() {
            beforeEach(function() {
                this.server.lastFetchFor(this.executionModel).fail([
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
