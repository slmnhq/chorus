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
                spyOn(_, "delay").andCallFake(function(fn, ms) {
                    fn();
                    return 22;
                });
                spyOn(window, "clearTimeout");

                this.view.trigger("file:executionStarted")
            })
            
            it("sets the executing class", function() {
                expect(this.view.$(".right")).toHaveClass("executing");
            })

            it("starts a spinner", function() {
                expect(_.delay).toHaveBeenCalledWith(jasmine.any(Function), 250);
                expect(this.view.$(".loading").isLoading()).toBeTruthy();
            })

            it("saves the timer id", function() {
                expect(this.view.timerId).toBeDefined();
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
                        delete this.view.timerId;
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
                        delete this.view.timerId;
                        this.view.trigger("file:executionCompleted");
                    })

                    itRemovesExecutionUI(false);
                })
            })

            function itRemovesExecutionUI(shouldCancelTimer) {
                it("removes the executing class", function() {
                    expect(this.view.$(".right")).not.toHaveClass("executing");
                })

                it("stops the spinner", function() {
                    expect(this.view.$(".loading").isLoading()).toBeFalsy();
                })

                if (shouldCancelTimer) {
                    it("cancels a running spinner delay", function() {
                        expect(window.clearTimeout).toHaveBeenCalledWith(22);
                    })
                } else {
                    it("does not cancel the spinner delay", function() {
                        expect(window.clearTimeout).not.toHaveBeenCalled();
                    })
                }
            }
        })
    })
})
