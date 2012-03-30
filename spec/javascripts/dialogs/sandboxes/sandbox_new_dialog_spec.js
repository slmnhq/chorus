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

    context("when aurora is not configured", function() {
        beforeEach(function() {
            chorus.models.Instance.aurora().set({ installationStatus: "nope"});
            this.dialog.render();
        })

        it("does not display the radio buttons", function() {
            expect(this.dialog.$("input:radio[name='sandbox_type']")).not.toExist();
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

    context("when aurora is configured", function() {
        beforeEach(function() {
            chorus.models.Instance.aurora().set({ installationStatus: "install_succeed"});
            chorus.models.Config.instance().set({provisionMaxSizeInGB: 2000});
            chorus.models.Instance.aurora().loaded = true;
            chorus.models.Config.instance().loaded = true;
            this.dialog.render();
        })

        it("enables the 'as a standalone' radio button (not checked)", function() {
            expect(this.dialog.$("input[value='as_standalone']")).toBeEnabled();
            expect(this.dialog.$("input[value='within_instance']").prop("checked")).toBeTruthy();
        });

        describe("clicking the 'as a standalone' radio button", function() {
            beforeEach(function() {
                this.dialog.$("input[value='as_standalone']").click();
            });

            it("should show the 'as a standalone' form", function() {
                expect(this.dialog.$(".instance_mode")).toHaveClass("hidden");
                expect(this.dialog.$(".standalone_mode")).not.toHaveClass("hidden");
            });

            it("enables the save button", function() {
                expect(this.dialog.$("button.submit")).toBeEnabled();
            });

            it("validates the model", function() {
                this.dialog.$("button.submit").click();
                var $el = this.dialog.$(".standalone_mode");
                expect($el.find("input[name=instanceName]")).toHaveClass("has_error");
                expect($el.find("input[name=schemaName]")).not.toHaveClass("has_error");
                expect($el.find("input[name=databaseName]")).toHaveClass("has_error");
                expect($el.find("input[name=size]")).toHaveClass("has_error");
            });
        });

        context("clicking the 'within an instance' radio button", function() {
            beforeEach(function() {
                this.dialog.$("input[value='within_instance']").click();
            });

            it("should show the 'within an instance' form", function() {
                expect(this.dialog.$(".instance_mode")).not.toHaveClass("hidden");
                expect(this.dialog.$(".standalone_mode")).toHaveClass("hidden");
            });
        });
    })
});
