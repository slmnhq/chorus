describe("chorus.dialogs.SandboxNew", function() {
    beforeEach(function() {
        this.workspace = fixtures.workspace();
        spyOn(chorus, 'styleSelect');
        var launchElement = $("<a data-workspace-id='45'></a>");
        this.dialog = new chorus.dialogs.SandboxNew({launchElement: launchElement, pageModel: this.workspace});
    })

    describe("#setup", function() {
        it("fetches the aurora config", function() {
            expect(this.server.lastFetch().url).toBe("/edc/provisioning/A4CProvisioner?type=install")
        })

        it("does not create subviews yet", function() {
            expect(this.dialog.instanceMode).toBeUndefined();
            expect(this.dialog.standaloneMode).toBeUndefined();
        })

        it("does not fetch chorus config yet", function() {
            expect(this.server.fetches().length).toBe(1);
        })

        describe("when the aurora config fetch returns", function() {
            beforeEach(function() {
                this.server.lastFetch().succeed([{installationStatus: "install_succeed"}]);
            })

            it("fetches the chorus config", function() {
                expect(this.server.lastFetch().url).toBe("/edc/config/");
            })

            it("does not create subviews yet", function() {
                expect(this.dialog.instanceMode).toBeUndefined();
                expect(this.dialog.standaloneMode).toBeUndefined();
            })

            describe("when the config fetch returns", function() {
                beforeEach(function() {
                    spyOn(this.dialog, "render");
                    this.server.lastFetch().succeed([{
                        "provisionMaxSizeInGB" : 2000,
                        "provisionMaxSize" : "2000 GB",
                        "sandboxRecommendSizeInBytes" : 5368709120,
                        "sandboxRecommendSize":"5 GB"
                    }])
                });

                it("configures the maximum size in the sandbox", function() {
                    expect(this.dialog.model.maximumSize).toBe(2000);
                })

                it("does creates subviews", function() {
                    expect(this.dialog.instanceMode).toBeDefined();
                    expect(this.dialog.standaloneMode).toBeDefined();
                })

                it("rerenders", function() {
                    expect(this.dialog.render).toHaveBeenCalled();
                })
            })
        })

    })

    context("#render", function() {
        beforeEach(function() {
            spyOn($.fn, 'qtip');
        });

        context("when aurora is configured", function() {
            beforeEach(function() {
                this.server.lastFetch().succeed([{installationStatus: "install_succeed"}]);
            })

            describe("before the configuration fetch has returned", function() {
                it("does not render any maximum size information", function(){
                    expect(this.dialog.$(".max_size").text()).toBe("");
                })
            })

            context("after the configuration fetch has returned", function() {
                beforeEach(function() {
                    this.server.lastFetch().succeed([{
                        "provisionMaxSizeInGB" : 2000,
                        "provisionMaxSize" : "2000 GB",
                        "sandboxRecommendSizeInBytes" : 5368709120,
                        "sandboxRecommendSize":"5 GB"
                    }])
                })

                it("enables the 'as a standalone' radio button", function() {
                   expect(this.dialog.$("input[value='as_standalone']")).toBeEnabled();
                });

                it("does not display the 'requires data director' label", function() {
                    expect(this.dialog.$("label[for='as_standalone']").text().trim()).toMatchTranslation("sandbox.create.as_standalone");
                });

                it("renders maximum size information", function(){
                    expect(this.dialog.$(".max_size").text()).toMatchTranslation("sandbox.create_standalone_dialog.max_size", { size : 2000 })
                })

                describe("clicking the 'as a standalone' radio button", function() {
                    beforeEach(function() {
                        this.dialog.$("input[value='as_standalone']").click();
                    });

                    it("should show the 'as a standalone' form", function() {
                        expect(this.dialog.$(".instance_mode")).toHaveClass("hidden");
                        expect(this.dialog.$(".standalone_mode")).not.toHaveClass("hidden");
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

                it("displays a help tooltip for standalone mode", function() {
                    expect(this.dialog.$("label[for='as_standalone']")).toContain("img.help");
                    expect($.fn.qtip).toHaveBeenCalled();
                    var qtipCall = $.fn.qtip.calls[0];
                    expect(qtipCall.object).toBe("img.help");
                    expect(qtipCall.args[0].content).toMatchTranslation("sandbox.create.standalone_dialog.help_text");
                });
            })
        })

        context("when aurora is not configured", function() {
            beforeEach(function() {
                this.server.lastFetch().succeed([{installationStatus: "not-installed"}]);
            })

            context("and the configuration fetch has returned", function() {
                beforeEach(function() {
                    this.server.lastFetch().succeed([{
                        "provisionMaxSizeInGB" : 2000,
                        "provisionMaxSize" : "2000 GB",
                        "sandboxRecommendSizeInBytes" : 5368709120,
                        "sandboxRecommendSize":"5 GB"
                    }])
                })

                it("disables the 'as a standalone' radio button", function() {
                    expect(this.dialog.$("input[value='as_standalone']")).toBeDisabled();
                });

                it("displays the 'requires data director' label", function() {
                    expect(this.dialog.$("label[for='as_standalone']").text().trim()).toMatchTranslation("sandbox.create.standalone.requires_data_director");
                });
            })
        })
    });

    context("clicking the submit button", function() {
        beforeEach(function() {
            this.sandbox = this.dialog.model;
            spyOn(this.sandbox, 'save').andCallThrough();
            this.server.lastFetch().succeed([{installationStatus: "install_succeed"}]);
            this.server.lastFetch().succeed([{
                "provisionMaxSizeInGB" : 2000,
                "provisionMaxSize" : "2000 GB",
                "sandboxRecommendSizeInBytes" : 5368709120,
                "sandboxRecommendSize":"5 GB"
            }])
        });

        context("when the 'instance mode' form is showing", function() {
            beforeEach(function() {
                this.dialog.$("input[value='within_instance']").click();
            });

            context("with a instance id, database id, and schema id", function() {
                beforeEach(function() {
                    spyOn(this.dialog.instanceMode, 'fieldValues').andReturn({
                        instance: "4",
                        database: "5",
                        schema:   "6"
                    });
                    this.dialog.instanceMode.trigger("change");
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
                        this.sandbox.trigger("saved");
                    });

                    it("fetches the page model (a workspace)", function() {
                        expect(this.workspace.fetch).toHaveBeenCalled();
                    });

                    it("closes the dialog", function() {
                        expect(this.dialog.closeModal).toHaveBeenCalled();
                    });

                    it("shows a toast message", function() {
                        expect(chorus.toast).toHaveBeenCalledWith("sandbox.create.toast");
                    });

                    it("triggers the 'invalidated' event on the page model (a workspace)", function() {
                        expect("invalidated").toHaveBeenTriggeredOn(this.workspace);
                    });
                });
            });

            context("with a database name and schema name", function() {
                beforeEach(function() {
                    spyOn(this.dialog.instanceMode, 'fieldValues').andReturn({
                        instance: "4",
                        databaseName: "New_Database",
                        schemaName:   "New_Schema"
                    });

                    this.dialog.instanceMode.trigger("change");
                    this.dialog.$("button.submit").click();
                });

                it("should set the database name and schema name on the model", function() {
                    expect(this.sandbox.get("databaseName")).toBe("New_Database");
                    expect(this.sandbox.get("schemaName")).toBe("New_Schema");
                });
            });
        });

        context("when the 'standalone mode' form is showing", function() {
            beforeEach(function() {
                this.dialog.$("input[name='sandbox_type']").val("as_standalone");

                spyOn(this.dialog.standaloneMode, 'fieldValues').andReturn({
                    instanceName: "My_Instance",
                    databaseName: "New_Database",
                    schemaName:   "New_Schema",
                    size: '45'
                });

                this.dialog.$("button.submit").click();
            });

            it("should set the instance, database and schema names on the model", function() {
                expect(this.sandbox.get("instanceName")).toBe("My_Instance");
                expect(this.sandbox.get("databaseName")).toBe("New_Database");
                expect(this.sandbox.get("schemaName")).toBe("New_Schema");
            });

            describe("when the model is saved successfully", function() {
                    beforeEach(function() {
                        spyOn(chorus, 'toast');
                        this.sandbox.trigger("saved");
                    });

                    it("shows a toast message", function() {
                        expect(chorus.toast).toHaveBeenCalledWith("sandbox.create.standalone.toast");
                    });
                });
        });
    });
});
