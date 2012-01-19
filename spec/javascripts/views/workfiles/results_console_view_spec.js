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
                this.view.trigger("file:executionStarted")
            })
            
            it("sets the executing class", function() {
                expect(this.view.$(".right")).toHaveClass("executing");
            })

            it("starts a spinner", function() {
                expect(this.view.$(".loading").isLoading()).toBeTruthy();
            })

            describe("cancelling the execution", function(){
                beforeEach(function() {
                    this.view.$(".cancel").click();
                })

                it("cancels the execution", function() {
                    var update = this.server.lastUpdate();
                    expect(update).toBeDefined();
                    expect(update.requestBody).toContain("action=cancel")
                })

                it("removes the executing class", function() {
                    expect(this.view.$(".right")).not.toHaveClass("executing");
                })

                it("stops the spinner", function() {
                    expect(this.view.$(".loading").isLoading()).toBeFalsy();
                })
            })

            describe("file:executionCompleted", function() {
                beforeEach(function() {
                    this.task = fixtures.taskWithResult();
                    this.view.trigger("file:executionCompleted", this.task);
                });

                it("renders a task data table with the given task", function() {
                    expect(this.view.dataTable).toBeA(chorus.views.TaskDataTable);
                    expect(this.view.dataTable.model).toBe(this.task);
                    expect($(this.view.el)).toContain(this.view.dataTable.el);
                });

                it("unsets the executing class", function() {
                    expect(this.view.$(".right")).not.toHaveClass("executing");
                });

                it("stops the spinner", function() {
                    expect(this.view.$(".loading").isLoading()).toBeFalsy();
                })
            });
        })
    })
})
