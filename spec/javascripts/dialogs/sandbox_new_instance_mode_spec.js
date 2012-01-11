describe("chorus.dialogs.SandboxNewInstanceMode", function() {
    beforeEach(function() {
        this.workspace = fixtures.workspace();
        spyOn(chorus, 'styleSelect');
        var launchElement = $("<a data-workspace-id='45'></a>");
        this.view = new chorus.views.SandboxNewInstanceMode();
    });

    describe("#render", function() {
        beforeEach(function() {
            spyOnEvent(this.view, 'change');
            this.view.render();
            this.dialogContainer = $("<div class='dialog sandbox_new'></div>").append(this.view.el);
            $('#jasmine_content').append(this.dialogContainer);
        });

        it("fetches the list of instances", function() {
            expect(this.server.requests[0].url).toMatch("/edc/instance/");
        });

        itDisplaysLoadingPlaceholderFor('instance');

        itShowsUnavailableTextWhenResponseIsEmptyFor('instance');

        context("when the instance list fetch completes", function() {
            beforeEach(function() {
                this.view.instances.loaded = true;
                this.view.instances.reset([fixtures.instance(), fixtures.instance()]);
            });

            itShowsSelect('instance');
            itPopulatesSelect('instance');
            itHidesSection('database');
            itHidesSection('schema');

            itDisplaysDefaultOptionFor('instance')

            itSortsTheSelectOptionsAlphabetically('instance');

            it("does not add Hadoop instances to the instance list", function() {
                this.view.instances.reset([fixtures.instance(), fixtures.instance({instanceProvider: "Hadoop"}), fixtures.instance()]);
                var options = this.view.$(".instance select option");
                expect(options.length).toBe(3);
                expect(options.eq(0).val()).toBeFalsy();
                expect(options.eq(1).val()).toBe(this.view.instances.models[0].get("id"));
                expect(options.eq(2).val()).toBe(this.view.instances.models[2].get("id"));
            });

            it("hides the loading placeholder", function() {
                expect(this.view.$(".instance .loading_text")).not.toBeVisible();
            })

            context("choosing an instance", function() {
                beforeEach(function() {
                    this.view.$(".instance select").prop("selectedIndex", 1).change();
                    this.selectedInstance = this.view.instances.get(this.view.$('.instance select option:selected').val());
                });

                itDisplaysLoadingPlaceholderFor('database');
                itHidesSection('schema');

                context("when the response is empty for databases", function() {
                    beforeEach(function() {
                        this.view.databases.loaded = true;
                        this.view.databases.reset([]);
                    });

                    itShowsUnavailable("database");

                    describe("choosing another instance", function() {
                        beforeEach(function() {
                            this.view.$(".instance select").prop("selectedIndex", 2).change();
                        });

                        itDisplaysLoadingPlaceholderFor('database');
                    });

                    describe("clicking 'new database'", function() {
                        beforeEach(function() {
                            this.view.$(".database a.new").click();
                        });

                        itShowsCreateFields('database');
                    });
                });

                it("fetches the list of databases", function() {
                    expect(this.server.requests[1].url).toMatch("/edc/instance/" + this.selectedInstance.get('id') + "/database");
                });

                context("when the database list fetch completes", function() {
                    beforeEach(function() {
                        this.view.databases.loaded = true;
                        this.view.databases.reset([fixtures.database(), fixtures.database()]);
                    });

                    itShowsSelect('database');
                    itPopulatesSelect('database');
                    itDisplaysDefaultOptionFor('database');

                    itSortsTheSelectOptionsAlphabetically('database')

                    it("hides the loading placeholder", function() {
                        expect(this.view.$(".database .loading_text")).not.toBeVisible();
                    });

                    it("shows the 'new database' link", function() {
                        expect(this.view.$(".database a.new")).toBeVisible();
                    });

                    context("creating a database", function() {
                        beforeEach(function() {
                            this.view.$(".database a.new").click();
                        });

                        it("hides the database selector", function() {
                            expect(this.view.$(".database select")).toBeHidden();
                        });

                        it("shows the database name, save, and cancel link", function() {
                            expect(this.view.$(".database .create_container")).toBeVisible();
                            expect(this.view.$(".database .create_container a.cancel")).toBeVisible();
                        });

                        it("shows the schema section", function() {
                            expect(this.view.$(".schema")).toBeVisible();
                        });

                        it("shows the schema name field and cancel link", function() {
                            expect(this.view.$(".schema .create_container")).toBeVisible();
                            expect(this.view.$(".schema .create_container a.cancel")).toBeHidden();
                        });

                        it("has a default schema name of 'public'", function() {
                            expect(this.view.$(".schema input.name").val()).toBe('public');
                        });

                        itTriggersTheChangeEvent();

                        context("clicking the cancel link", function() {
                            beforeEach(function() {
                                this.view.$(".database input.name").val("my_database").keyup();
                                this.view.$(".database .cancel").click();
                            });

                            it("hides the name, save, and cancel link", function() {
                                expect(this.view.$(".database .create_container")).toBeHidden();
                                expect(this.view.$(".database .create_container a.cancel")).toBeHidden();
                            });

                            itTriggersTheChangeEvent();

                            it("hides the schema section", function() {
                                expect(this.view.$(".schema")).toBeHidden();
                            });

                            it("hides the 'new schema' link", function() {
                                expect(this.view.$(".schema a.new")).toBeHidden();
                            });

                            it("hides the schema name field and cancel link", function() {
                                expect(this.view.$(".schema .create_container")).toBeHidden();
                                expect(this.view.$(".schema .create_container a.cancel")).toBeHidden();
                            });

                            describe("choosing a database and then creating a schema", function() {
                                beforeEach(function() {
                                    var select = this.view.$(".database select");
                                    select.prop("selectedIndex", 1);
                                    select.change();
                                    this.view.$(".schema a.new").click();
                                });

                                it("shows the cancel link", function() {
                                    expect(this.view.$(".schema a.cancel")).toBeVisible();
                                });

                                it("has no default schema name", function() {
                                    expect(this.view.$(".schema input.name").val()).toBe("");
                                });
                            });
                        });
                    });

                    context("choosing a database", function() {
                        beforeEach(function() {
                            var select = this.view.$(".database select");
                            select.prop("selectedIndex", 1);
                            select.change();
                            this.selectedDatabase = this.view.databases.get(this.view.$('.database select option:selected').val());
                        });

                        itDisplaysLoadingPlaceholderFor('schema');

                        it("fetches the list of databases", function() {
                            expect(this.server.requests[2].url).toMatch("/edc/instance/" + this.selectedInstance.get('id') + "/database/" + this.selectedDatabase.get("id") + "/schema");
                        });

                        itShowsUnavailableTextWhenResponseIsEmptyFor('schema');

                        context("when the schema list fetch completes", function() {
                            beforeEach(function() {
                                this.view.schemas.loaded = true;
                                this.view.schemas.reset(fixtures.schema());
                            });

                            itShowsSelect("schema");
                            itPopulatesSelect("schema");
                            itDisplaysDefaultOptionFor('schema')

                            itSortsTheSelectOptionsAlphabetically('schema');

                            it("hides the loading placeholder", function() {
                                expect(this.view.$(".schema .loading_text")).not.toBeVisible();
                            });

                            it("shows the 'new schema' link", function() {
                                expect(this.view.$(".schema a.new")).toBeVisible();
                            });

                            context("creating a schema", function() {
                                beforeEach(function() {
                                    this.view.$(".schema a.new").click();
                                });

                                it("hides the schema selector", function() {
                                    expect(this.view.$(".schema .unavailable")).toBeHidden();
                                    expect(this.view.$(".schema .select_container")).toBeHidden();
                                });

                                it("hides the 'new schema' link", function() {
                                    expect(this.view.$(".schema a.new")).toBeHidden();
                                });

                                it("shows the schema name and cancel link", function() {
                                    expect(this.view.$(".schema .create_container")).toBeVisible();
                                    expect(this.view.$(".schema .create_container a.cancel")).toBeVisible();
                                });

                                it("has no default schema name", function() {
                                    expect(this.view.$(".schema input.name").val()).toBe("");
                                });

                                itTriggersTheChangeEvent();

                                context("clicking the cancel link", function() {
                                    beforeEach(function() {
                                        this.view.$(".schema .cancel").click();
                                    });

                                    itTriggersTheChangeEvent();

                                    it("shows the schema selector", function() {
                                        expect(this.view.$(".schema .select_container")).toBeVisible();
                                    });

                                    it("shows the 'new schema' link", function() {
                                        expect(this.view.$(".schema a.new")).toBeVisible();
                                    });

                                    it("hides the schema name, and cancel link", function() {
                                        expect(this.view.$(".schema .create_container")).toBeHidden();
                                        expect(this.view.$(".schema .create_container a.cancel")).toBeHidden();
                                    });

                                    describe("when you click new database", function() {
                                        beforeEach(function() {
                                            this.view.$(".database a.new").click();
                                        });

                                        it("should set the default schema name to 'public'", function() {
                                            expect(this.view.$(".schema input.name").val()).toBe("public");
                                        });
                                    });
                                });
                            });

                            context("choosing a schema", function() {
                                beforeEach(function() {
                                    var select = this.view.$(".schema select");
                                    select.prop("selectedIndex", 1);
                                    select.change();
                                    this.selectedSchema = this.view.schemas.get(this.view.$('.schema select option:selected').val());
                                });

                                itTriggersTheChangeEvent();

                                context("un-choosing a schema", function() {
                                    beforeEach(function() {
                                        this.view.$(".schema select").prop("selectedIndex", 0).change();
                                    });

                                    itTriggersTheChangeEvent();
                                });

                                describe("clicking the 'new database' link", function() {
                                    beforeEach(function() {
                                        this.view.$(".database a.new").click();
                                    });

                                    itTriggersTheChangeEvent();
                                });

                                context("changing the database", function() {
                                    beforeEach(function() {
                                        var select = this.view.$(".database select");
                                        select.prop("selectedIndex", 2);
                                        select.change();
                                    });

                                    itShouldResetSelect('schema');

                                    context("changing the instance", function() {
                                        beforeEach(function() {
                                            var select = this.view.$(".instance select");
                                            select.prop("selectedIndex", 2);
                                            select.change();
                                        });

                                        itShouldResetSelect('database');
                                        itShouldResetSelect('schema');
                                    });
                                });

                                context("unselecting the database", function() {
                                    beforeEach(function() {
                                        var select = this.view.$(".database select");
                                        select.prop("selectedIndex", 0);
                                        select.change();
                                    });

                                    itHidesSection('schema');

                                    context("unselecting the instance", function() {
                                        beforeEach(function() {
                                            var select = this.view.$(".instance select");
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
    });

    describe("#fieldValues", function() {
        beforeEach(function() {
            this.view.render();
            this.view.instances.reset([ fixtures.instance({ id: '4' }) ]);
            this.view.$(".instance select").val("4").change();
        });

        context("when an instance, database, and schema are selected from the dropdowns", function() {
            beforeEach(function() {
                this.view.databases.reset([ fixtures.database({ id: '5' }) ]);
                this.view.$(".database select").val("5").change();
                this.view.schemas.reset([ fixtures.schema({ id: '6' }) ]);
                this.view.$(".schema select").val("6").change();
            });

            it("returns instance, database, and schema ids", function() {
                expect(this.view.fieldValues()).toEqual({
                    instance: '4',
                    database: '5',
                    schema:   '6'
                });
            });
        });

        context("when the user enters new database and schema names", function() {
            beforeEach(function() {
                this.view.$(".database a.new").click();
                this.view.$(".database input.name").val("New_Database");
                this.view.$(".schema input.name").val("New_Schema").keyup();
            });

            it("returns the instance id and the database and schema names", function() {
                expect(this.view.fieldValues()).toEqual({
                    instance: '4',
                    databaseName: 'New_Database',
                    schemaName:   'New_Schema'
                });
            });
        });
    });


    function itDisplaysLoadingPlaceholderFor(type) {
        it("displays the loading placeholder for " + type, function() {
            expect(this.view.$("." + type + " .loading_text").text()).toMatch(t("loading"));
            expect(this.view.$("." + type + " .loading_text")).toBeVisible();
            expect(this.view.$("." + type + " select")).not.toBeVisible();
            expect(this.view.$('.' + type + ' label ')).toBeVisible();
            expect(this.view.$('.' + type + ' .unavailable')).toBeHidden();

            // Remove when adding "register a new instance" story
            if (type != "instance") {
                expect(this.view.$('.' + type + ' a')).toBeVisible();
            }
        });
    }

    function itDisplaysDefaultOptionFor(type) {
        it("displays the default option for '" + type + "'", function() {
            expect(this.view.$("." + type + " select option:eq(0)").text()).toMatchTranslation("sandbox.select_one");
        });
    }

    function itShouldResetSelect(type) {
        it("should reset " + type + " select", function() {
            expect(this.view.$('.' + type + ' select option:selected').val()).toBeFalsy();
            expect(this.view.$('.' + type + ' select option').length).toBe(1);
        });

        itTriggersTheChangeEvent();
    }

    function itHidesSection(type) {
        it("should hide the " + type + " section", function() {
            expect(this.view.$('.' + type + ' label')).toBeHidden();
            expect(this.view.$('.' + type + ' select ').val()).toBeFalsy();
            expect(this.view.$('.' + type + ' select')).toBeHidden();
            expect(this.view.$('.' + type + ' a')).toBeHidden();
        });
    }

    function itPopulatesSelect(type) {
        it("populates the select for for " + type + "s", function() {
            expect(this.view.$("." + type + " select option:eq(1)").text()).toBe(this.view[type + "s"].models[0].get('name'));
        });
    }

    function itShowsSelect(type) {
        it("should show the " + type + " select and hide the 'unavailable' message", function() {
            expect(this.view.$('.' + type + ' label ')).not.toHaveClass("hidden");
            expect(this.view.$('.' + type + ' select option').length).toBeGreaterThan(1);
            expect(this.view.$('.' + type + ' select')).toBeVisible();
        });
    }

    function itShowsUnavailable(type) {
        it("should show the 'unavailable' text for the " + type + " section and hide the select", function() {
            expect(this.view.$('.' + type + ' .unavailable')).toBeVisible();
            expect(this.view.$('.' + type + ' .loading_text')).toBeHidden();
            expect(this.view.$('.' + type + ' .select_container')).not.toBeVisible();
        });
    }

    function itShowsUnavailableTextWhenResponseIsEmptyFor(type) {
        context("when the response is empty for " + type, function() {
            beforeEach(function() {
                this.view[type + 's'].loaded = true;
                this.view[type + 's'].reset([]);
            });

            itShowsUnavailable(type);
        });
    }

    function itShowsCreateFields(type) {
        it("shows the fields to create a new " + type, function() {
            expect(this.view.$(".create_container")).toBeVisible();
            expect(this.view.$('.' + type + ' .unavailable')).toBeHidden();
            expect(this.view.$('.' + type + ' .loading_text')).toBeHidden();
            expect(this.view.$('.' + type + ' .select_container')).toBeHidden();
        });
    }

    function itTriggersTheChangeEvent() {
        it("triggers the 'change' event on itself", function() {
            expect("change").toHaveBeenTriggeredOn(this.view);
        });
    }

    function itSortsTheSelectOptionsAlphabetically(type) {
        it("sorts the select options alphabetically for " + type, function() {
            this.view[type + "s"].loaded = true;
            this.view[type + "s"].reset([fixtures[type]({name : "Zoo"}), fixtures[type]({name: "Aardvark"}), fixtures[type]({name: "bear"})]);

            expect(this.view.$("." + type + " select option:eq(1)").text()).toBe("Aardvark");
            expect(this.view.$("." + type + " select option:eq(2)").text()).toBe("bear");
            expect(this.view.$("." + type + " select option:eq(3)").text()).toBe("Zoo");
        });
    }
});
