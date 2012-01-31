describe("chorus.views.ResultsConsoleView", function() {
    beforeEach(function() {
        this.model = fixtures.task({
            checkId : "foo",
            result : {
                message : "hi there"
            }
        });
        this.view = new chorus.views.ResultsConsole({model: this.model});
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
                this.view.options.titleKey = "test.deer";
                this.view.render();
            });

            it("displays the supplied title", function() {
                expect(this.view.$("h1").text().trim()).toMatchTranslation("test.deer")
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
    })

    describe("event handling", function() {
        beforeEach(function() {
            this.view.render();
        })

        describe("action:close", function() {
            beforeEach(function() {
                this.view.options.enableClose = true;
                this.view.render();

                spyOnEvent(this.view, "action:close");
                this.view.$("a.close").click();
            });
            
            it("triggers the event", function() {
                expect("action:close").toHaveBeenTriggeredOn(this.view);
            });
        });

        describe("file:executionStarted", function() {
            beforeEach(function() {
                spyOn(_, "delay").andCallThrough();
                spyOn(window, "clearTimeout");

                this.view.trigger("file:executionStarted")
            })

            it("sets the executing class", function() {
                expect(this.view.$(".right")).toHaveClass("executing");
            })

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
                        this.view.trigger("file:executionCompleted", this.task);
                    })

                    itRemovesExecutionUI(true);
                    itShowsExecutionResults();
                });

                context("when the spinner has been started", function() {
                    beforeEach(function() {
                        delete this.view.spinnerTimer;
                        delete this.view.elapsedTimer;
                        this.task = fixtures.taskWithResult();
                        this.view.trigger("file:executionCompleted", this.task);
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
                        this.view.trigger("file:executionCompleted", this.task);
                    });

                    it("should show the error header", function() {
                        expect(this.view.$('.errors')).not.toHaveClass('hidden');
                    })

                    it("should show 'View Details' and 'Close' links", function() {
                        expect(this.view.$('.errors .view_details')).toExist();
                        expect(this.view.$('.errors .close_errors')).toExist();
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

                        it("should show the result content area", function() {
                            expect(this.view.$(".result_content")).not.toHaveClass("hidden");
                        });
                    });
                    
                    context("when the sql is executed again without errors", function() {
                        beforeEach(function() {
                            this.task = fixtures.taskWithResult();
                            this.view.trigger("file:executionCompleted", this.task);
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
                    expect(this.view.$(".loading").isLoading()).toBeFalsy();
                })

                if (shouldCancelTimers) {
                    it("cancels the spinner and elapsed time timers", function() {
                        expect(window.clearTimeout.callCount).toBe(2);
                    })
                } else {
                    it("does not cancel the spinner delay", function() {
                        expect(window.clearTimeout).not.toHaveBeenCalled();
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

                context("when another execution completed event occurs", function() {
                    beforeEach(function() {
                        this.view.trigger("file:executionCompleted", fixtures.taskWithResult());
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

                        specify("the expander button arrow points up", function() {
                             expect(this.view.$(".arrow")).toHaveClass("up");
                             expect(this.view.$(".arrow")).not.toHaveClass("down");
                         });

                        it("does not keep the maxmized height", function() {
                            expect(this.view.$(".data_table").css("height")).not.toBe("777px");
                        });

                    })
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
                            var selector1 = "."+tableShouldHaveClass.slice(0,-1);
                            var selector2 = "."+tableShouldNotHaveClass.slice(0,-1);
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
            expect(this.view.$(".loading").isLoading()).toBeTruthy();
        })
    })

    describe("#incrementElapsedTime", function() {
        beforeEach(function() {
            this.view.render();
            this.view.elapsedTimer = 22;
            this.view.elapsedTime = 40;
            spyOn(_, "delay").andCallThrough();
            this.view.incrementElapsedTime();
        })

        it("updates execution time", function() {
            expect(this.view.$(".elapsed_time").text().trim()).toMatchTranslation("results_console_view.elapsed", { sec : 41 })
        })

        it("reschedules itself", function() {
            expect(_.delay).toHaveBeenCalledWith(jasmine.any(Function), 1000);
        })
    })
})
