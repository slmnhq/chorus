describe("chorus.dialogs.SandboxNew", function() {
    beforeEach(function() {
        this.workspace = fixtures.workspace();
        spyOn(chorus, 'styleSelect');
    })

    describe("#render", function() {
        beforeEach(function() {
            var launchElement = $("<a data-workspace-id='45'></a>");
            this.dialog = new chorus.dialogs.SandboxNew({ launchElement: launchElement, pageModel: this.workspace });
            this.dialog.render();
            $('#jasmine_content').append(this.dialog.el);
        });

        it("has a disabled submit button", function() {
            expect(this.dialog.$("button.submit")).toBeDisabled();
        });

        it("fetches the list of instances", function() {
            expect(this.server.requests[0].url).toMatch("/edc/instance/");
        });

        itDisplaysLoadingPlaceholderFor('instance');

        itShowsUnavailableTextWhenResponseIsEmptyFor('instance');

        context("when the instance list fetch completes", function() {
            beforeEach(function() {
                this.dialog.instances.loaded = true;
                this.dialog.instances.reset([fixtures.instance(), fixtures.instance()]);
            });

            itShowsSelect('instance');
            itPopulatesSelect('instance');
            itHidesSection('database');
            itHidesSection('schema');

            itDisplaysDefaultOptionFor('instance')

            itSortsTheSelectOptionsAlphabetically('instance');

            it("hides the loading placeholder", function() {
                expect(this.dialog.$(".instance .loading_text")).not.toBeVisible();
            })

            context("choosing an instance", function() {
                beforeEach(function() {
                    var select = this.dialog.$(".instance select");
                    select.prop("selectedIndex", 1);
                    select.change();
                    this.selectedInstance = this.dialog.instances.get(this.dialog.$('.instance select option:selected').val());
                });

                itDisplaysLoadingPlaceholderFor('database');
                itHidesSection('schema');

                itShowsUnavailableTextWhenResponseIsEmptyFor('database');

                it("fetches the list of databases", function() {
                    expect(this.server.requests[1].url).toMatch("/edc/instance/" + this.selectedInstance.get('id') + "/database");
                });

                context("when the database list fetch completes", function() {
                    beforeEach(function() {
                        this.dialog.databases.loaded = true;
                        this.dialog.databases.reset([fixtures.database(), fixtures.database()]);
                    });

                    itShowsSelect('database');
                    itPopulatesSelect('database');
                    itDisplaysDefaultOptionFor('database');

                    itSortsTheSelectOptionsAlphabetically('database')

                    it("hides the loading placeholder", function() {
                        expect(this.dialog.$(".database .loading_text")).not.toBeVisible();
                    });

                    it("shows the 'new database' link", function() {
                        expect(this.dialog.$(".database a.new")).toBeVisible();
                    });

                    context("creating a database", function() {
                        beforeEach(function() {
                            this.dialog.$(".database a.new").click();
                        });

                        it("hides the database selector", function() {
                            expect(this.dialog.$(".database select")).toBeHidden();
                        });

                        it("shows the database name, save, and cancel link", function() {
                            expect(this.dialog.$(".database .create_container")).toBeVisible();
                            expect(this.dialog.$(".database .create_container a.cancel")).toBeVisible();
                        });

                        it("shows the schema label", function() {
                            expect(this.dialog.$(".schema label")).toBeVisible();
                        });

                        itDisablesTheSubmitButton();

                        it("re-enables the submit button when a database name is entered", function() {
                            this.dialog.$(".database input.name").val("my_database").keyup();
                            expect(this.dialog.$("button.submit")).toBeEnabled();
                        });

                        it("doesn't re-enable the submit button when the schema name changes", function() {
                            expect(this.dialog.$(".database input.name").val()).toBe("");
                            this.dialog.$(".schema input.name").val("my_schema").keyup();
                            expect(this.dialog.$("button.submit")).toBeDisabled();
                        });

                        it("shows the schema name field and cancel link", function() {
                            expect(this.dialog.$(".schema .create_container")).toBeVisible();
                            expect(this.dialog.$(".schema .create_container a.cancel")).toBeHidden();
                        });

                        context("clicking the cancel link", function() {
                            beforeEach(function() {
                                this.dialog.$(".database input.name").val("my_database").keyup();
                                this.dialog.$(".database .cancel").click();
                            });

                            it("hides the name, save, and cancel link", function() {
                                expect(this.dialog.$(".database .create_container")).toBeHidden();
                                expect(this.dialog.$(".database .create_container a.cancel")).toBeHidden();
                            });

                            itDisablesTheSubmitButton();

                            it("hides the schema label", function() {
                                expect(this.dialog.$(".schema label")).toBeHidden();
                            });

                            it("hides the 'new schema' link", function() {
                                expect(this.dialog.$(".schema a.new")).toBeHidden();
                            });

                            it("hides the schema name field and cancel link", function() {
                                expect(this.dialog.$(".schema .create_container")).toBeHidden();
                                expect(this.dialog.$(".schema .create_container a.cancel")).toBeHidden();
                            });

                            describe("choosing a database and then creating a schema", function() {
                                beforeEach(function() {
                                    var select = this.dialog.$(".database select");
                                    select.prop("selectedIndex", 1);
                                    select.change();
                                    this.dialog.$(".schema a.new").click();
                                });

                                it("shows the cancel link", function() {
                                    expect(this.dialog.$(".schema a.cancel")).toBeVisible();
                                });
                            });
                        });
                    });

                    context("choosing a database", function() {
                        beforeEach(function() {
                            var select = this.dialog.$(".database select");
                            select.prop("selectedIndex", 1);
                            select.change();
                            this.selectedDatabase = this.dialog.databases.get(this.dialog.$('.database select option:selected').val());
                        });

                        itDisplaysLoadingPlaceholderFor('schema');

                        it("fetches the list of databases", function() {
                            expect(this.server.requests[2].url).toMatch("/edc/instance/" + this.selectedInstance.get('id') + "/database/" + this.selectedDatabase.get("id") + "/schema");
                        });

                        itShowsUnavailableTextWhenResponseIsEmptyFor('schema');

                        context("when the schema list fetch completes", function() {
                            beforeEach(function() {
                                this.dialog.schemas.loaded = true;
                                this.dialog.schemas.reset(fixtures.schema());
                            });

                            itShowsSelect("schema");
                            itPopulatesSelect("schema");
                            itDisplaysDefaultOptionFor('schema')

                            itSortsTheSelectOptionsAlphabetically('schema');

                            it("hides the loading placeholder", function() {
                                expect(this.dialog.$(".schema .loading_text")).not.toBeVisible();
                            });

                            it("shows the 'new schema' link", function() {
                                expect(this.dialog.$(".schema a.new")).toBeVisible();
                            });


                            context("creating a schema", function() {
                                beforeEach(function() {
                                    this.dialog.$(".schema a.new").click();
                                });

                                it("hides the schema selector", function() {
                                    expect(this.dialog.$(".schema .unavailable")).toBeHidden();
                                    expect(this.dialog.$(".schema .select_container")).toBeHidden();
                                });

                                it("hides the 'new schema' link", function() {
                                    expect(this.dialog.$(".schema a.new")).toBeHidden();
                                });

                                it("shows the schema name and cancel link", function() {
                                    expect(this.dialog.$(".schema .create_container")).toBeVisible();
                                    expect(this.dialog.$(".schema .create_container a.cancel")).toBeVisible();
                                });

                                it("has a default schema name of 'public'", function() {
                                    expect(this.dialog.$(".schema input.name").val()).toBe('public');
                                });

                                itEnablesTheSubmitButton();

                                it("disables the submit button when the schema name field is blank", function() {
                                    this.dialog.$(".schema input.name").val("").keyup();
                                    expect(this.dialog.$("button.submit")).toBeDisabled();

                                    this.dialog.$(".schema input.name").val("my_schema").keyup();
                                    expect(this.dialog.$("button.submit")).toBeEnabled();
                                });

                                context("clicking the cancel link", function() {
                                    beforeEach(function() {
                                        this.dialog.$(".schema .cancel").click();
                                    });

                                    itDisablesTheSubmitButton();

                                    it("shows the schema selector", function() {
                                        expect(this.dialog.$(".schema .select_container")).toBeVisible();
                                    });

                                    it("shows the 'new schema' link", function() {
                                        expect(this.dialog.$(".schema a.new")).toBeVisible();
                                    });

                                    it("hides the schema name, and cancel link", function() {
                                        expect(this.dialog.$(".schema .create_container")).toBeHidden();
                                        expect(this.dialog.$(".schema .create_container a.cancel")).toBeHidden();
                                    });
                                });
                            });

                            context("choosing a schema", function() {
                                beforeEach(function() {
                                    var select = this.dialog.$(".schema select");
                                    select.prop("selectedIndex", 1);
                                    select.change();
                                    this.selectedSchema = this.dialog.schemas.get(this.dialog.$('.schema select option:selected').val());
                                });

                                itEnablesTheSubmitButton();

                                context("un-choosing a schema", function() {
                                    beforeEach(function() {
                                        this.dialog.$(".schema select").prop("selectedIndex", 0).change();
                                    });

                                    itDisablesTheSubmitButton();
                                });

                                describe("clicking the 'new database' link", function() {
                                    beforeEach(function() {
                                        this.dialog.$(".database a.new").click();
                                    });

                                    itDisablesTheSubmitButton();
                                });

                                context("changing the database", function() {
                                    beforeEach(function() {
                                        var select = this.dialog.$(".database select");
                                        select.prop("selectedIndex", 2);
                                        select.change();
                                    });

                                    itShouldResetSelect('schema');

                                    context("changing the instance", function() {
                                        beforeEach(function() {
                                            var select = this.dialog.$(".instance select");
                                            select.prop("selectedIndex", 2);
                                            select.change();
                                        });

                                        itShouldResetSelect('database');
                                        itShouldResetSelect('schema');
                                    });
                                });

                                context("unselecting the database", function() {
                                    beforeEach(function() {
                                        var select = this.dialog.$(".database select");
                                        select.prop("selectedIndex", 0);
                                        select.change();
                                    });

                                    itHidesSection('schema');

                                    context("unselecting the instance", function() {
                                        beforeEach(function() {
                                            var select = this.dialog.$(".instance select");
                                            select.prop("selectedIndex", 0);
                                            select.change();
                                        });

                                        itHidesSection('database');
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        context("clicking the submit button", function() {
            beforeEach(function() {
                this.sandbox = this.dialog.model;
                spyOn(this.sandbox, 'save').andCallThrough();

                this.dialog.instances.reset([ fixtures.instance({ id: '4' }) ]);
                this.dialog.$(".instance select").val("4").change();
            });

            context("with a instance id, database id, and schema id", function() {
                beforeEach(function() {
                    this.dialog.databases.reset([ fixtures.database({ id: '5' }) ]);
                    this.dialog.$(".database select").val("5").change();

                    this.dialog.schemas.reset([ fixtures.schema({ id: '6' }) ]);
                    this.dialog.$(".schema select").val("6").change();

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
                });
            });

            context("with a database name and schema name", function() {
                beforeEach(function() {
                    this.dialog.render();

                    this.dialog.$(".database a.new").click();
                    this.dialog.$(".database input.name").val("New_Database");
                    this.dialog.$(".schema input.name").val("New_Schema").keyup();

                    this.dialog.$("button.submit").click();
                });

                it("should set the database name and schema name on the model", function() {
                    expect(this.sandbox.get("databaseName")).toBe("New_Database");
                    expect(this.sandbox.get("schemaName")).toBe("New_Schema");
                });
            });
        });
    });

    function itDisplaysLoadingPlaceholderFor(type) {
        it("displays the loading placeholder for " + type, function() {
            expect(this.dialog.$("." + type + " .loading_text").text()).toMatch(t("loading"));
            expect(this.dialog.$("." + type + " .loading_text")).toBeVisible();
            expect(this.dialog.$("." + type + " select")).not.toBeVisible();
            expect(this.dialog.$('.' + type + ' label ')).toBeVisible();

            // Remove when adding "register a new instance" story
            if (type != "instance") {
                expect(this.dialog.$('.' + type + ' a')).toBeVisible();
            }
        });
    }

    function itDisplaysDefaultOptionFor(type) {
        it("displays the default option for '" + type + "'", function() {
            expect(this.dialog.$("." + type + " select option:eq(0)").text()).toMatchTranslation("sandbox.select_one");
        });
    }

    function itShouldResetSelect(type) {
        it("should reset " + type + " select", function() {
            expect(this.dialog.$('.' + type + ' select option:selected').val()).toBeFalsy();
            expect(this.dialog.$('.' + type + ' select option').length).toBe(1);
        });

        itDisablesTheSubmitButton();
    }

    function itHidesSection(type) {
        it("should hide the " + type + " section", function() {
            expect(this.dialog.$('.' + type + ' label ')).toHaveClass("hidden");
            expect(this.dialog.$('.' + type + ' select ').val()).toBeFalsy();
            expect(this.dialog.$('.' + type + ' select')).toBeHidden();
            expect(this.dialog.$('.' + type + ' a')).toBeHidden();
        });
    }

    function itPopulatesSelect(type) {
        it("populates the select for for " + type + "s", function() {
            expect(this.dialog.$("." + type + " select option:eq(1)").text()).toBe(this.dialog[type + "s"].models[0].get('name'));
        });
    }

    function itShowsSelect(type) {
        it("should show the " + type + " select and hide the 'unavailable' message", function() {
            expect(this.dialog.$('.' + type + ' label ')).not.toHaveClass("hidden");
            expect(this.dialog.$('.' + type + ' select option').length).toBeGreaterThan(1);
            expect(this.dialog.$('.' + type + ' select')).toBeVisible();
        });
    }

    function itShowsUnavailable(type) {
        it("should show the 'unavailable' text for the " + type + " section and hide the select", function() {
            expect(this.dialog.$('.' + type + ' .unavailable')).toBeVisible();
            expect(this.dialog.$('.' + type + ' .loading_text')).toBeHidden();
            expect(this.dialog.$('.' + type + ' .select_container')).not.toBeVisible();
        });
    }

    function itShowsUnavailableTextWhenResponseIsEmptyFor(type) {
        context("when the response is empty for " + type, function() {
            beforeEach(function() {
                this.dialog[type + 's'].loaded = true;
                this.dialog[type + 's'].reset([]);
            });

            itShowsUnavailable(type);
        });
    }

    function itEnablesTheSubmitButton() {
        it("enables the submit button", function() {
            expect(this.dialog.$("button.submit")).toBeEnabled();
        });
    }

    function itDisablesTheSubmitButton() {
        it("disables the submit button", function() {
            expect(this.dialog.$("button.submit")).toBeDisabled();
        });
    }

    function itSortsTheSelectOptionsAlphabetically(type) {
        it("sorts the select options alphabetically for " + type, function() {
            this.dialog[type + "s"].loaded = true;
            this.dialog[type + "s"].reset([fixtures[type]({name : "Zoo"}), fixtures[type]({name: "Aardvark"}), fixtures[type]({name: "bear"})]);

            expect(this.dialog.$("." + type + " select option:eq(1)").text()).toBe("Aardvark");
            expect(this.dialog.$("." + type + " select option:eq(2)").text()).toBe("bear");
            expect(this.dialog.$("." + type + " select option:eq(3)").text()).toBe("Zoo");
        });
    }

});
