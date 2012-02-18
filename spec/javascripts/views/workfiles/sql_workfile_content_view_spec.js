describe("chorus.views.SqlWorkfileContentView", function() {
    beforeEach(function() {
        this.workfile = fixtures.sqlWorkfile({ content: "select * from foos where bar_id = 1;" });
        spyOn(this.workfile, 'executionSchema').andReturn(fixtures.schema({
            id: '4',
            name: "schema",
            databaseId: '3',
            databaseName: "db",
            instanceId: '2',
            instanceName: "instance"
        }));
        this.view = new chorus.views.SqlWorkfileContent({model: this.workfile});
        stubDefer();
    })

    describe("initialization", function() {
        it("has a TextWorkfileContent view", function() {
            expect(this.view.textContent).toBeA(chorus.views.TextWorkfileContent);
        })

        it("has a ResultsConsole view", function() {
            expect(this.view.resultsConsole).toBeA(chorus.views.ResultsConsole);
        })

        it("delcares hotkeys", function() {
            expect(this.view.hotkeys.r).toBeDefined();
        })
    })

    describe("executing the workfile", function() {
        beforeEach(function() {
            spyOn(chorus.PageEvents, "broadcast").andCallThrough();
            this.view.render();
            this.view.textContent.editor.setValue("select * from foos");
        });

        context("when no execution is outstanding", function() {
            describe("running in another schema", function() {
                beforeEach(function() {
                    chorus.PageEvents.broadcast("file:runInSchema", {
                        instance: '4',
                        database: '5',
                        schema: '6'
                    })
                })

                it("creates a task with the right parameters", function() {
                    expect(this.view.task.get("sql")).toBe("select * from foos");
                    expect(this.view.task.get("instanceId")).toBe("4");
                    expect(this.view.task.get("databaseId")).toBe("5");
                    expect(this.view.task.get("schemaId")).toBe("6");
                    expect(this.view.task.get("entityId")).toBe(this.workfile.get("id"));
                    expect(this.view.task.has("checkId")).toBeTruthy();
                });
            })

            describe("running in the default schema", function() {
                beforeEach(function() {
                    chorus.PageEvents.broadcast("file:runCurrent");
                })

                it("creates a task with the right parameters", function() {
                    expect(this.view.task.get("sql")).toBe("select * from foos");
                    expect(this.view.task.get("instanceId")).toBe("2");
                    expect(this.view.task.get("databaseId")).toBe("3");
                    expect(this.view.task.get("schemaId")).toBe("4");
                    expect(this.view.task.get("entityId")).toBe(this.workfile.get("id"));
                    expect(this.view.task.has("checkId")).toBeTruthy();
                });

                it("saves the task", function() {
                    expect(this.server.creates().length).toBe(1);
                    expect(this.server.lastCreate().url).toBe(this.view.task.url());
                });

                it("broadcasts file:executionStarted", function() {
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:executionStarted", jasmine.any(chorus.models.SqlExecutionTask));
                })

                describe("when the task completes successfully", function() {
                    beforeEach(function() {
                        this.server.lastCreate().succeed([{
                            id : "10100",
                            state : "success",
                            result : {
                                message : "hi there"
                            }
                        }]);
                    })

                    it("broadcasts file:executionSucceeded", function() {
                        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:executionSucceeded", jasmine.any(chorus.models.SqlExecutionTask));
                    });

                    it("sets the executing property to false", function() {
                        expect(this.view.executing).toBeFalsy();
                    });

                    describe("executing again", function() {
                        beforeEach(function() {
                            chorus.PageEvents.broadcast("file:runCurrent");
                        })

                        it("executes the task again", function() {
                            expect(this.server.creates().length).toBe(2);
                        })
                    })
                })

                describe("when the task completion fails", function() {
                    beforeEach(function() {
                        this.server.lastCreate().fail();
                    })

                    it("broadcasts file:executionFailed", function() {
                        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:executionFailed", jasmine.any(chorus.models.SqlExecutionTask));
                    });

                    it("sets the executing property to false", function() {
                        expect(this.view.executing).toBeFalsy();
                    });
                })
            });

            context("when an execution is already outstanding", function() {
                beforeEach(function() {
                    chorus.PageEvents.broadcast("file:runCurrent");
                    this.startedSpy = jasmine.createSpy();
                    chorus.PageEvents.subscribe("file:executionStarted", this.startedSpy);
                    chorus.PageEvents.broadcast("file:runCurrent");
                })

                it('does not start a new execution', function() {
                    expect(this.startedSpy).not.toHaveBeenCalled();
                })
            })
        })
    });
});
