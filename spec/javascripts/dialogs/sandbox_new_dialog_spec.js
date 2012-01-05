describe("chorus.dialogs.SandboxNew", function() {
    beforeEach(function() {
        this.workspace = fixtures.workspace();
        spyOn($.fn, 'chosen');
    })

    describe("#render", function() {
        beforeEach(function() {
            window.dialog = this.dialog = new chorus.dialogs.SandboxNew({ workspace : this.workspace });
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

        context("when the instance list fetch completes", function() {
            beforeEach(function() {
                this.dialog.instances.loaded = true;
                this.dialog.instances.reset([fixtures.instance(), fixtures.instance()]);
            });

            itDisplaysDefaultOptionFor('instance')

            it("renders the dropdown for instances", function() {
                expect(this.dialog.$(".instance select")).toBeVisible();
                expect(this.dialog.$(".instance select option:eq(1)").text()).toBe(this.dialog.instances.models[0].get('name'));
            });

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

                it("fetches the list of databases", function() {
                    expect(this.server.requests[1].url).toMatch("/edc/instance/" + this.selectedInstance.get('id') + "/database");
                });

                context("when the database list fetch completes", function() {
                    beforeEach(function() {
                        this.dialog.databases.loaded = true;
                        this.dialog.databases.reset([fixtures.database(), fixtures.database()]);
                    });

                    itDisplaysDefaultOptionFor('database');

                    it("renders the dropdown for databases", function() {
                        expect(this.dialog.$(".database select")).toBeVisible();
                        expect(this.dialog.$(".database select option:eq(1)").text()).toBe(this.dialog.databases.models[0].get('name'));
                    });

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

                        context("when the schema list fetch completes", function() {
                            beforeEach(function() {
                                this.dialog.schemas.loaded = true;
                                this.dialog.schemas.reset(fixtures.schema());
                            });

                            itDisplaysDefaultOptionFor('schema')

                            it("renders the dropdown for schemas", function() {
                                expect(this.dialog.$(".schema select")).toBeVisible();
                                expect(this.dialog.$(".schema select option:eq(1)").text()).toBe(this.dialog.schemas.models[0].get('name'));
                            });

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

                                    itShouldHideSelect('schema');

                                    context("unselecting the instance", function() {
                                        beforeEach(function() {
                                            var select = this.dialog.$(".instance select");
                                            select.prop("selectedIndex", 0);
                                            select.change();
                                        });

                                        itShouldHideSelect('database');
                                        itShouldHideSelect('schema');
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
        });
    }

    function itDisplaysDefaultOptionFor(type) {
        it("displays the default option for '"+type+"'", function() {
            expect(this.dialog.$("."+type+" select option:eq(0)").text()).toMatchTranslation("sandbox.select_one");
        });
    }

    function itShouldResetSelect(type) {
        it("should reset " + type + " select", function() {
            expect(this.dialog.$('.' + type + ' select option:selected').val()).toBeFalsy();
            expect(this.dialog.$('.' + type + ' select option').length).toBe(1);
        });
    }

    function itShouldHideSelect(type) {
        it("should hide " + type + " select", function() {
            expect(this.dialog.$('.' + type + ' select ').val()).toBeFalsy();
            expect(this.dialog.$('.' + type + ' select option').length).toBe(1);
            expect(this.dialog.$('.' + type + ' select')).toBeHidden();
        });
    }

});
