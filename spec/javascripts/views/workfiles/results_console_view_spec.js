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

        it("displays the result message", function() {
            expect(this.view.$(".right")).not.toHaveClass("executing");
            expect(this.view.$(".message").text().trim()).toBe("hi there")
        })
    })

    describe("event handling", function() {
        beforeEach(function() {
            this.view.render();
        })
        
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

            describe("cancelling the execution", function(){
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
                        this.view.trigger("file:executionCompleted");
                    })

                    itRemovesExecutionUI(true);
                });

                context("when the spinner has been started", function() {
                    beforeEach(function() {
                        delete this.view.spinnerTimer;
                        delete this.view.elapsedTimer;
                        this.view.trigger("file:executionCompleted");
                    })

                    itRemovesExecutionUI(false);
                })
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
