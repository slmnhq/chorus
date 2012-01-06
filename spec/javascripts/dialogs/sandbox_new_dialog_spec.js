describe("chorus.dialogs.SandboxNew", function() {
    beforeEach(function() {
        this.workspace = fixtures.workspace();
        spyOn($.fn, 'chosen');
    })

    describe("#render", function() {
        beforeEach(function() {
            var launchElement = $("<a data-workspace-id='45'></a>");
            window.dialog = this.dialog = new chorus.dialogs.SandboxNew({ launchElement: launchElement, pageModel: this.workspace });
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

                    it("hides the loading placeholder", function() {
                        expect(this.dialog.$(".database .loading_text")).not.toBeVisible();
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

                            it("hides the loading placeholder", function() {
                                expect(this.dialog.$(".schema .loading_text")).not.toBeVisible();
                            });

                            context("choosing a schema", function() {
                                beforeEach(function() {
                                    var select = this.dialog.$(".schema select");
                                    select.prop("selectedIndex", 1);
                                    select.change();
                                    this.selectedSchema = this.dialog.schemas.get(this.dialog.$('.schema select option:selected').val());
                                });

                                it("enables the submit button", function() {
                                    expect(this.dialog.$("button.submit")).not.toBeDisabled();
                                });

                                context("un-choosing a schema", function() {
                                    it("disables the button", function(){
                                        var select = this.dialog.$(".schema select");
                                        select.prop("selectedIndex", 0);
                                        select.change();

                                        expect(this.dialog.$("button.submit")).toBeDisabled();
                                    });
                                });

                                context("clicking the submit button", function() {
                                    beforeEach(function() {
                                        this.sandbox = this.dialog.model;
                                        spyOn(this.sandbox, 'save').andCallThrough();
                                        this.dialog.$("button.submit").click();
                                    });

                                    it("changes the button text to 'Adding...'", function() {
                                        expect(this.dialog.$("button.submit").text()).toMatchTranslation("sandbox.adding_sandbox");
                                    });

                                    it("sets the button to a loading state", function() {
                                        expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
                                    });

                                    it("sets the instanceId, schemaId and databaseId on the sandbox", function() {
                                        expect(this.sandbox.get("instance")).toBe(this.selectedInstance.get('id'));
                                        expect(this.sandbox.get("database")).toBe(this.selectedDatabase.get('id'));
                                        expect(this.sandbox.get("schema")).toBe(this.selectedSchema.get('id'));
                                    });

                                    it("saves the sandbox", function() {
                                        expect(this.sandbox.save).toHaveBeenCalled();
                                    });

                                    describe("when save fails", function() {
                                        beforeEach(function() {
                                            spyOn(this.dialog, 'closeModal');
                                            this.sandbox.trigger("saveFailed");
                                        });

                                        it("takes the button out of the loading state", function() {
                                            expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
                                        });
                                    });

                                    describe("when the model is saved successfully", function() {
                                        beforeEach(function() {
                                            spyOn(this.dialog, 'closeModal');
                                            spyOnEvent(this.workspace, 'invalidated');
                                            spyOn(chorus, 'toast');
                                            this.sandbox.trigger("saved");
                                        });

                                        it("triggers the 'invalidated' event on the page model (a workspace)", function() {
                                            expect('invalidated').toHaveBeenTriggeredOn(this.workspace);
                                        });

                                        it("closes the dialog", function() {
                                            expect(this.dialog.closeModal).toHaveBeenCalled();
                                        });

                                        it("shows a toast message", function() {
                                            expect(chorus.toast).toHaveBeenCalledWith("sandbox.create.toast");
                                        });
                                    });
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
    });

    function itDisplaysLoadingPlaceholderFor(type) {
        it("displays the loading placeholder for " + type, function() {
            expect(this.dialog.$("." + type + " .loading_text").text()).toMatch(t("loading"));
            expect(this.dialog.$("." + type + " .loading_text")).toBeVisible();
            expect(this.dialog.$("." + type + " select")).not.toBeVisible();
            expect(this.dialog.$('.' + type + ' label ')).toBeVisible();
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

        it("disables the submit button", function() {
            expect(this.dialog.$("button.submit")).toBeDisabled();
        });
    }

    function itHidesSection(type) {
        it("should hide the " + type + " section", function() {
            expect(this.dialog.$('.' + type + ' label ')).toHaveClass("hidden");
            expect(this.dialog.$('.' + type + ' select ').val()).toBeFalsy();
            expect(this.dialog.$('.' + type + ' select')).toBeHidden();
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

});
