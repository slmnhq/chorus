describe("chorus.dialogs.RunFileInSchema", function () {
    beforeEach(function () {
        chorus.page = { workspace:newFixtures.workspace({ id:999 }) };
        this.workfile = fixtures.workfile({ fileType:"SQL", workspaceId:chorus.page.workspace.get("id") });
        this.dialog = new chorus.dialogs.RunFileInSchema({ pageModel:this.workfile });
    });

    it("does not re-render when the model changes", function () {
        expect(this.dialog.persistent).toBeTruthy()
    })

    describe("#setup", function () {
        context("when the workspace has not been fetched", function() {
            it("fetches the workspace", function () {
                expect(this.server.lastFetchFor(newFixtures.workspace({id: 999}))).toBeDefined();
            });
        });

        context("when the workspace has already been fetched", function() {
            beforeEach(function() {
                this.server.reset();
                this.workfile.loaded = true;
                this.dialog = new chorus.dialogs.RunFileInSchema({ pageModel: this.workfile });
            });

            it("does not fetch the model", function() {
                expect(this.server.lastFetchFor(newFixtures.workspace({id: 999}))).not.toBeDefined();
            });
        });
    })

    describe("#render", function () {
        beforeEach(function () {
            this.dialog.render();
        });

        context("before the workspace fetch completes", function () {
            it("should show loading spinner", function () {
                expect(this.dialog.$(".loading")).not.toHaveClass("hidden");
                expect(this.dialog.$(".loading").isLoading()).toBeTruthy();
            })

            it("selects 'within another schema' by default", function () {
                expect(this.dialog.$("#another_schema")).toBeChecked();
            })

            it("disables the 'within the workspace sandbox' radio button", function () {
                expect(this.dialog.$("input#sandbox_schema")).toBeDisabled();
                expect(this.dialog.$("label[for=sandbox_schema]")).toHaveClass('disabled');
            })

            it("expands 'within another schema' by default", function () {
                expect(this.dialog.$("#another_schema")).not.toHaveClass("collapsed")
            })

            it("has the right title", function () {
                expect(this.dialog.$(".dialog_header h1")).toContainTranslation("workfile.run_in_schema.title");
            });

            it("has a Run File button", function () {
                expect(this.dialog.$("button.submit").text().trim()).toMatchTranslation("workfile.run_in_schema.run_file")
            })

            it("has a Cancel button", function () {
                expect(this.dialog.$("button.cancel").text().trim()).toMatchTranslation("actions.cancel")
            })

            it("disables the Run File button", function () {
                expect(this.dialog.$("button.submit")).toBeDisabled();
            })

            it("enables the Cancel button", function () {
                expect(this.dialog.$("button.cancel")).toBeEnabled();
            })
        });

        context("after the workspace fetch completes", function () {
            context("when the workspace has a sandbox", function () {
                beforeEach(function () {
                    this.server.completeFetchFor(newFixtures.workspace({id:999, sandboxInfo:{
                        instance_id:44,
                        instanceName:"instance",
                        databaseId:55,
                        databaseName:"database",
                        schemaId:66,
                        schemaName:"schema",
                        sandboxId:"10001"
                    }}));
                });

                it("displays the canonical name for the sandbox schema", function () {
                    expect(this.dialog.$(".name").text().trim()).toBe(this.dialog.workspace.sandbox().schema().canonicalName())
                })

                it("enables the 'within the workspace sandbox' radio button", function () {
                    expect(this.dialog.$("input#sandbox_schema")).toBeEnabled();
                    expect(this.dialog.$("label[for=sandbox_schema]")).not.toHaveClass('disabled');
                })

                describe("clicking on 'within the workspace sandbox'", function () {
                    beforeEach(function () {
                        this.dialog.$("input#sandbox_schema").click();
                    })

                    it("collapses 'within another schema", function () {
                        expect(this.dialog.$(".another_schema")).toHaveClass("collapsed")
                    })

                    describe("clicking on 'within another schema'", function () {
                        beforeEach(function () {
                            this.dialog.$("input#another_schema").click();
                        })

                        it("expands 'within another schema'", function () {
                            expect(this.dialog.$(".another_schema")).not.toHaveClass("collapsed");
                        })
                    })
                })
            });

            context("when the workspace does not have a sandbox", function () {
                beforeEach(function () {
                    this.server.completeFetchFor(newFixtures.workspace({id:999, sandboxInfo:{
                        instance_id:null,
                        instanceName:null,
                        databaseId:null,
                        databaseName:null,
                        schemaId:null,
                        schemaName:null,
                        sandboxId:null
                    }}));
                });
                it("disables the 'within the workspace sandbox' radio button", function () {
                    expect(this.dialog.$("input#sandbox_schema")).toBeDisabled();
                    expect(this.dialog.$("label[for=sandbox_schema]")).toHaveClass('disabled');
                })
            });

            describe("button handling", function () {
                beforeEach(function () {
                    this.server.completeFetchFor(newFixtures.workspace({id:999, sandboxInfo:{
                        instance_id:44,
                        instanceName:"instance",
                        databaseId:55,
                        databaseName:"database",
                        schemaId:66,
                        schemaName:"schema",
                        sandboxId:"10001"
                    }}));

                    spyOn(this.dialog.schemaPicker, "fieldValues").andReturn({
                        instance:5,
                        database:6,
                        schema:7
                    })
                    spyOn(this.dialog, "closeModal");
                    spyOnEvent(this.dialog, "run");
                })

                context("when 'within the workspace sandbox' is selected", function () {
                    beforeEach(function () {
                        this.dialog.$("input#sandbox_schema").prop("checked", true)
                        this.dialog.$("input#sandbox_schema").click();
                    })

                    it("enables the Run File button", function () {
                        expect(this.dialog.$("button.submit")).toBeEnabled();
                    })

                    describe("and the Run File button is clicked", function () {
                        beforeEach(function () {
                            spyOn(chorus.PageEvents, "broadcast").andCallThrough();
                            this.dialog.$("button.submit").click();
                        })

                        it("broadcasts the file:runInSchema event", function () {
                            expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:runInSchema",
                                {
                                    instance:44,
                                    database:55,
                                    schema:66
                                }
                            );
                        })

                        it("closes the dialog", function () {
                            expect(this.dialog.closeModal).toHaveBeenCalled();
                        })
                    })
                })

                context("when 'within another schema' is selected", function () {
                    context("and the schema picker is not ready", function () {
                        beforeEach(function () {
                            spyOn(this.dialog.schemaPicker, "ready").andReturn(false);
                            this.dialog.$("input#another_schema").click();
                        })

                        it("disables the Run File button", function () {
                            expect(this.dialog.$("button.submit")).toBeDisabled();
                        })
                    })

                    context("and the schema picker is ready", function () {
                        beforeEach(function () {
                            spyOn(chorus.PageEvents, "broadcast").andCallThrough();
                            spyOn(this.dialog.schemaPicker, "ready").andReturn(true);
                            this.dialog.$("input#another_schema").click();
                        })

                        it("enables the Run File button", function () {
                            expect(this.dialog.$("button.submit")).toBeEnabled();
                        })

                        describe("and the Run File button is clicked", function () {
                            beforeEach(function () {
                                this.dialog.$("button.submit").click();
                            })

                            it("broadcasts the file:runInSchema event", function () {
                                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:runInSchema",
                                    {
                                        instance:5,
                                        database:6,
                                        schema:7
                                    }
                                );
                            })

                            it("closes the dialog", function () {
                                expect(this.dialog.closeModal).toHaveBeenCalled();
                            })
                        })
                    })
                })
            })
        });

        context("when the SchemaPicker triggers an error", function() {
                beforeEach(function() {
                    var modelWithError = fixtures.schemaSet();
                    modelWithError.serverErrors = { fields: { a: { BLANK: {} } } }
                    this.dialog.schemaPicker.trigger("error", modelWithError);
                });

                it("shows the error", function() {
                    expect(this.dialog.$('.errors')).toContainText("A can't be blank");
                });

                context("and then the schemaPicker triggers clearErrors", function(){
                    it("clears the errors", function() {
                        this.dialog.schemaPicker.trigger("clearErrors");
                        expect(this.dialog.$('.errors')).toBeEmpty();
                    });
                });
                context("and then selecting 'within the workspace sandbox'", function() {
                    beforeEach(function() {
                        this.server.completeFetchFor(newFixtures.workspace({id: 999, sandboxInfo: {
                            instance_id: 44,
                            instanceName: "instance",
                            databaseId: 55,
                            databaseName: "database",
                            schemaId: 66,
                            schemaName: "schema",
                            sandboxId: "10001"
                        }}));
                        this.dialog.$("input#sandbox_schema").click();
                    });
                    it("clears the errors", function() {
                        expect(this.dialog.$('.errors')).toBeEmpty();
                    });
                });
            });
    });
});
