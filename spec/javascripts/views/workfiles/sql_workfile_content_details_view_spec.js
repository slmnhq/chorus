describe("chorus.views.SqlWorkfileContentDetails", function() {
    beforeEach(function() {
        this.model = fixtures.workfile({ fileName: 'test.sql', content: "select * from foo" });
        this.model.workspace().set({
            sandboxInfo : {
                databaseId: '3',
                databaseName: "db",
                instanceId: '2',
                instanceName: "instance",
                sandboxId: "10001",
                schemaId: '4',
                schemaName: "schema"
            }});
        this.view = new chorus.views.SqlWorkfileContentDetails({ model : this.model })
        spyOn(this.view, 'runInSandbox').andCallThrough();
        this.qtipElement = stubQtip()
    });

    describe("render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("shows the 'Run File' button", function() {
            expect(this.view.$('button.run_file')).toContainTranslation('workfile.content_details.run_file')
        });

        context("opening the Run File menu", function() {
            beforeEach(function() {
                this.view.$(".run_file").click()
            })

            it("shows the 'run in another' schema link in the menu", function() {
                expect(this.qtipElement).toContainTranslation("workfile.content_details.run_in_another_schema")
            });

            describe("when the workspace has been run in a schema other than its sandbox's schema", function() {
                beforeEach(function() {
                    _.extend(this.model.get("versionInfo"), {
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
                        schemaName: this.model.defaultSchema().canonicalName()
                    });
                });
            });

            describe("when the workspace has a sandbox, and hasn't been executed in another schema'", function() {
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
                    spyOnEvent(this.view, 'file:runCurrent');
                    this.qtipElement.find(".run_default").click();
                    expect("file:runCurrent").not.toHaveBeenTriggeredOn(this.view);
                });
            });

            context("clicking on 'Run in sandbox'", function() {
                beforeEach(function() {
                    spyOnEvent(this.view, "file:runCurrent");
                    this.qtipElement.find('.run_default').click();
                });

                it("triggers the 'file:runCurrent' event on the view", function() {
                    expect("file:runCurrent").toHaveBeenTriggeredOn(this.view);
                });
            })

            describe("clicking on 'Run in another schema'", function() {
                beforeEach(function() {
                    spyOn(chorus.dialogs.RunFileInSchema.prototype, "launchModal")
                    this.qtipElement.find('.run_other_schema').click();
                });

                it("launches the RunFileInSchema dialog", function() {
                    expect(chorus.dialogs.RunFileInSchema.prototype.launchModal).toHaveBeenCalled();
                })

                describe("event handling", function() {
                    beforeEach(function() {
                        spyOnEvent(this.view, "file:runInSchema")
                        this.view.dialog.trigger("run", { foo : "bar" });
                    });

                    it("triggers file:runInSchema on itself when the dialog triggers a run event", function() {
                        expect("file:runInSchema").toHaveBeenTriggeredOn(this.view, [ { foo : "bar"}])
                    })

                    it("re-fetches the workfile", function() {
                        expect(this.server.lastFetchFor(this.view.model)).toBeDefined();
                    })

                    describe("when the fetch succeeds", function() {
                        beforeEach(function() {
                            this.view.model.set({
                                versionInfo : {
                                    databaseId: '33',
                                    databaseName: "db33",
                                    instanceId: '22',
                                    instanceName: "instance22",
                                    schemaId: '44',
                                    schemaName: "schema44"
                                }
                            }, { silent : true })
                            this.server.completeFetchFor(this.view.model)
                        });

                        it("re-renders, showing the new default schema", function() {
                            this.view.$(".run_file").click();
                            expect(this.qtipElement.find(".run_default")).toContainText(this.model.defaultSchema().canonicalName());
                        });
                    });
                })
            })
        })
    });
});
