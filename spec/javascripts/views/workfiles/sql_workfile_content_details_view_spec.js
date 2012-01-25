describe("chorus.views.SqlWorkfileContentDetails", function() {
    beforeEach(function() {
        this.model = fixtures.workfile({ fileName: 'test.sql', content: "select * from foo" });
        this.view = new chorus.views.SqlWorkfileContentDetails({ model : this.model })
        spyOn(this.view, 'runInSandbox').andCallThrough();
        this.qtipElement = stubQtip()
    });

    describe("#setup", function() {
        it("fetches the workfile's sandbox", function() {
            expect(this.server.lastFetch().url).toBe(this.model.sandbox().url());
        });
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

            it("doesn't include the 'run in sandbox' link in the run menu by default", function() {
                expect(this.qtipElement).not.toContainTranslation("workfile.content_details.run_workspace_sandbox")
            });

            describe("when the sandbox is fetched and the menu is opened again", function() {
                beforeEach(function() {
                    this.server.lastFetch().succeed([{ instanceId: 1, databaseId: 2, schemaId: 3 }]);
                    this.view.$(".run_file").click()
                });

                it("should show 'Run in the workspace sandbox'", function() {
                    expect(this.qtipElement).toContainTranslation("workfile.content_details.run_workspace_sandbox")
                });

                context("clicking on 'Run in my workspace'", function() {
                    beforeEach(function() {
                        spyOnEvent(this.view, "file:runCurrent");
                        this.qtipElement.find('.run_sandbox').click();
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
                        it("triggers file:runInSchema on itself when the dialog triggers a run event", function() {
                            spyOnEvent(this.view, "file:runInSchema")
                            this.view.dialog.trigger("run", { foo : "bar" });
                            expect("file:runInSchema").toHaveBeenTriggeredOn(this.view, [ { foo : "bar"}])
                        })
                    })
                })
            });
        })
    });
});
