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

            it("shows 'Run in the workspace sandbox'", function() {
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
        })
    });
});
