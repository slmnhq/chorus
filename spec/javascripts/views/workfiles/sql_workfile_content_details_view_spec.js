describe("chorus.views.SqlWorkfileContentDetails", function() {
    beforeEach(function() {
        this.model = rspecFixtures.workfile.sql({ fileName: 'test.sql', versionInfo: { content: "select * from foo" } });
        this.model.workspace().set({
            sandboxInfo: {
                id: 4, name: "schema",
                database: { id: 3, name: "db", instance: { id: 2, name: "instance" } }
            }});
        this.contentView = new chorus.views.SqlWorkfileContent({ model: this.model });
        spyOn(this.contentView, 'run');
        this.contentView.getSelectedText = function() {};

        this.view = new chorus.views.SqlWorkfileContentDetails({ model: this.model, contentView: this.contentView });
        spyOn(this.view, 'runInExecutionSchema').andCallThrough();
        this.qtipElement = stubQtip()
    });

    describe("render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("shows the 'Run File' button", function() {
            expect(this.view.$('button.run_file')).toContainTranslation('workfile.content_details.run_file')
        });

        it("shows the execution schema name", function() {
            expect(this.view.$(".execution_schema")).toHaveText(this.model.executionSchema().canonicalName())
        });

        it("puts the shortcuts next to the menu items", function() {
            expect(this.view.$("a.run_default").siblings(".menu_shortcut")).toContainText(chorus.helpers.hotKeyName("r"));
            expect(this.view.$("a.run_selection").siblings(".menu_shortcut")).toContainText(chorus.helpers.hotKeyName("e"));
        });

        context("when the workspace is archived", function() {
            beforeEach(function() {
                this.model.workspace().set({ archivedAt: "2012-05-08 21:40:14" });
                this.view.render();
            });

            it("should disable the 'Run File' menu", function() {
                expect(this.view.$(".run_file")).toBeDisabled();
            });
        });

        context("when the user has not selected any text", function() {
            beforeEach(function() {
                this.contentView.getSelectedText = function() {
                    return "";
                };
                spyOn(chorus.PageEvents, "broadcast").andCallThrough();
            });

            context("and opens the Run File menu", function() {
                beforeEach(function() {
                    this.view.$(".run_file").click()
                });

                it("disables the 'run selected sql' link in the menu", function() {
                    expect(this.qtipElement.find(".run_selection")).toHaveClass("disabled");
                });
            });
        });

        context("when the user has selected some text", function() {
            beforeEach(function() {
                this.contentView.getSelectedText = function() {
                    return "Chuck and Lenny";
                };

                spyOn(chorus.PageEvents, "broadcast").andCallThrough();
            });

            context("and there is a schema to run in", function() {
                context("and opens the Run File menu", function() {
                    beforeEach(function() {
                        this.view.$(".run_file").click();
                    });

                    it("enables the 'run selected sql' link in the menu", function() {
                        expect(this.qtipElement.find(".run_selection")).not.toHaveClass("disabled");
                    });

                    it("runs the selected sql when the user says to", function() {
                        this.qtipElement.find(".run_selection").click();
                        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:runSelected");
                    });
                });
            });

            context("and there is no schema to run in", function() {
                context("and opens the Run File menu", function() {
                    beforeEach(function() {
                        this.view.model.workspace().unset("sandboxInfo");
                        delete this.view.model.workspace()._sandbox;
                        this.view.render();
                        this.view.$(".run_file").click();
                    });

                    it("disables the 'run selected sql' link in the menu", function() {
                        expect(this.qtipElement.find(".run_selection")).toHaveClass("disabled");
                    });

                    it("has the right translation", function() {
                        expect(this.qtipElement.find(".run_selection")).toContainTranslation("workfile.content_details.run_selection_sandbox");
                    });

                    it("does nothing when the user clicks run selection", function() {
                        this.qtipElement.find(".run_selection").click();
                        expect(chorus.PageEvents.broadcast).not.toHaveBeenCalled();
                    });
                });
            });
        });

        context("opening the Run File menu", function() {
            beforeEach(function() {
                this.view.$(".run_file").click()
            });

            it("shows the 'run in another' schema link in the menu", function() {
                expect(this.qtipElement).toContainTranslation("workfile.content_details.run_in_another_schema")
            });

            xdescribe("when the workfile has been run in a schema other than its sandbox's schema", function() {
                beforeEach(function() {
                    // TODO: make this work against new api, new fixtures
                    _.extend(this.model.get("executionInfo"), {
                        instanceId: '51',
                        instanceName: "bob_the_instance",
                        databaseId: '52',
                        databaseName: "bar",
                        schemaId: '53',
                        schemaName: "wow"
                    });
                    this.view.render();
                    this.view.$(".run_file").click();
                });

                it("shows that schema's canonical name in the default 'run' link", function() {
                    var runLink = this.qtipElement.find(".run_default");
                    expect(runLink).toBe("a");
                    expect(runLink).toContainTranslation("workfile.content_details.run_in_last_schema", {
                        schemaName: this.model.executionSchema().canonicalName()
                    });
                });
            });

            describe("when the workspace has a sandbox, and hasn't been executed", function() {
                it("shows 'Run in the workspace sandbox'", function() {
                    var runLink = this.qtipElement.find(".run_default");
                    expect(runLink).toContainTranslation("workfile.content_details.run_workspace_sandbox")
                    expect(runLink).toBe("a");
                });
            });

            describe("when the workfile was last executed in its workspace's sandbox", function() {
                beforeEach(function() {
                    _.extend(this.model.get("versionInfo"), {
                        databaseId: '3',
                        databaseName: "db",
                        instanceId: '2',
                        instanceName: "instance",
                        schemaId: '4',
                        schemaName: "schema"
                    });
                    this.view.render();
                    this.view.$(".run_file").click();
                });

                it("shows 'Run in the workspace sandbox'", function() {
                    var runLink = this.qtipElement.find(".run_default");
                    expect(runLink).toContainTranslation("workfile.content_details.run_workspace_sandbox")
                    expect(runLink).toBe("a");
                });
            });

            describe("when the workspace does not have a sandbox", function() {
                beforeEach(function() {
                    spyOn(this.model.workspace(), 'sandbox');
                    this.view.render();
                    this.view.$(".run_file").click();
                });

                it("disables the 'run in sandbox' link", function() {
                    var runLink = this.qtipElement.find(".run_default");
                    expect(runLink).toContainTranslation("workfile.content_details.run_workspace_sandbox")
                    expect(runLink).toBe("span");
                });

                it("does nothing when the disabled span is clicked", function() {
                    spyOn(chorus.PageEvents, "broadcast").andCallThrough();
                    this.qtipElement.find(".run_default").click();
                    expect(chorus.PageEvents.broadcast).not.toHaveBeenCalled();
                });
            });

            context("clicking on 'Run in sandbox'", function() {
                beforeEach(function() {
                    spyOn(chorus.PageEvents, "broadcast").andCallThrough();
                    this.qtipElement.find('.run_default').click();
                });

                it("broadcasts the 'file:runCurrent' event on the view", function() {
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:runCurrent");
                });
            })

            describe("clicking on 'Run in another schema'", function() {
                it("launches the RunFileInSchema dialog", function() {
                    var modalSpy = stubModals();
                    this.qtipElement.find('.run_other_schema').click();
                    expect(modalSpy).toHaveModal(chorus.dialogs.RunFileInSchema);
                })
            });
        })
    });

    describe("event handling", function() {
        describe("workfile:executed", function() {
            beforeEach(function() {
                spyOn(this.view, "render");
                spyOnEvent(this.view.model, "change")
                this.executionInfo = {
                    instanceId: '51',
                    instanceName: "ned",
                    databaseId: '52',
                    databaseName: "rob",
                    schemaId: '53',
                    schemaName: "louis"
                };

                chorus.PageEvents.broadcast("workfile:executed", this.model, this.executionInfo);
            });

            it("updates the execution info in the workfile", function() {
                expect(this.view.model.get("executionInfo")).toBe(this.executionInfo);
            });

            it("re-renders", function() {
                expect(this.view.render).toHaveBeenCalled();
            });

            it("does not trigger change on the model", function() {
                expect("change").not.toHaveBeenTriggeredOn(this.view.model);
            });
        });
    });
});
