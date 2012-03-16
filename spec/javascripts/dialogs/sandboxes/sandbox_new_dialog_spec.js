describe("chorus.dialogs.SandboxNew", function() {
    beforeEach(function() {
        this.workspace = fixtures.workspace();
        spyOn(chorus, 'styleSelect');
        var launchElement = $("<a data-workspace-id='45'></a>");
        this.dialog = new chorus.dialogs.SandboxNew({launchElement: launchElement, pageModel: this.workspace});
        this.dialog.render();
    });

    context("when the SchemaPicker triggers an error", function() {
        beforeEach(function() {
            var modelWithError = fixtures.schemaSet();
            modelWithError.serverErrors = fixtures.serverErrors({
                message: 'oh nos!'
            });
            this.dialog.instanceMode.trigger("error", modelWithError);
        });

        it("shows the error", function() {
            expect(this.dialog.$('.errors')).toContainText('oh nos!');
        });

        context("and then the schemaPicker triggers clearErrors", function(){
            it("clears the errors", function() {
                this.dialog.instanceMode.trigger("clearErrors");
                expect(this.dialog.$('.errors')).toBeEmpty();
            });
        })
    });

    context("clicking the submit button", function() {
        beforeEach(function() {
            this.sandbox = this.dialog.model;
            spyOn(this.sandbox, 'save').andCallThrough();
        });

        context("without schema selected yet", function() {
            beforeEach(function() {
                spyOn(this.dialog.instanceMode, 'fieldValues').andReturn({
                    instance: "4",
                    database: "5",
                    schemaName: ""
                });
                this.dialog.instanceMode.trigger("change", "");
            });

            it("disables the submit button", function() {
                expect(this.dialog.$(".modal_controls button.submit")).toBeDisabled();
            });
        });

        context("with a instance id, database id, and schema id", function() {
            beforeEach(function() {
                spyOn(this.dialog.instanceMode, 'fieldValues').andReturn({
                    instance: "4",
                    database: "5",
                    schema: "6"
                });
                this.dialog.instanceMode.trigger("change", "6");
                this.dialog.$(".modal_controls button.submit").click();
            });

            it("saves the sandbox", function() {
                expect(this.sandbox.save).toHaveBeenCalled();
            });

            it("changes the button text to 'Adding...'", function() {
                expect(this.dialog.$(".modal_controls button.submit").text()).toMatchTranslation("sandbox.adding_sandbox");
            });

            it("sets the button to a loading state", function() {
                expect(this.dialog.$(".modal_controls button.submit").isLoading()).toBeTruthy();
            });

            it("sets the instance, schema and database on the sandbox", function() {
                expect(this.sandbox.get("instance")).toBe('4');
                expect(this.sandbox.get("database")).toBe('5');
                expect(this.sandbox.get("schema")).toBe('6');
            });

            describe("when save fails", function() {
                beforeEach(function() {
                    spyOn(this.dialog, 'closeModal');
                    this.sandbox.trigger("saveFailed");
                });

                it("takes the button out of the loading state", function() {
                    expect(this.dialog.$(".modal_controls button.submit").isLoading()).toBeFalsy();
                });
            });

            describe("when the model is saved successfully", function() {
                beforeEach(function() {
                    spyOnEvent(this.workspace, 'invalidated');
                    spyOn(this.dialog, 'closeModal');
                    spyOn(this.workspace, 'fetch');
                    spyOn(chorus, 'toast');
                    spyOn(chorus.router, 'reload');
                    this.sandbox.trigger("saved");
                });

                it("reloads the page", function() {
                    expect(chorus.router.reload).toHaveBeenCalled();
                });

                it("shows a toast message", function() {
                    expect(chorus.toast).toHaveBeenCalledWith("sandbox.create.toast");
                });
            });
        });

        context("with a database name and schema name", function() {
            beforeEach(function() {
                spyOn(this.dialog.instanceMode, 'fieldValues').andReturn({
                    instance: "4",
                    databaseName: "New_Database",
                    schemaName: "New_Schema"
                });

                this.dialog.instanceMode.trigger("change", "New_Schema");
                this.dialog.$("button.submit").click();
            });

            it("should set the database name and schema name on the model", function() {
                expect(this.sandbox.get("databaseName")).toBe("New_Database");
                expect(this.sandbox.get("schemaName")).toBe("New_Schema");
            });
        });
    });
});
