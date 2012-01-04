describe("chorus.dialogs.SandboxNew", function() {
    beforeEach(function() {
        this.workspace = fixtures.workspace();
        spyOn($.fn, 'chosen');
    })

    describe("#render", function() {
        beforeEach(function() {
            this.dialog = new chorus.dialogs.SandboxNew({ workspace : this.workspace });
            this.dialog.render();
            $('#jasmine_content').append(this.dialog.el);
        });

        it("has a disabled submit button", function() {
            expect(this.dialog.$("button.submit")).toBeDisabled();
        });

        it("fetches the list of instances", function() {
            expect(this.server.requests[0].url).toMatch("/edc/instance/");
        });

        it("displays the loading placeholder for instances", function() {
            expect(this.dialog.$(".instance .loading").text()).toMatch(t("loading"));
            expect(this.dialog.$(".instance .loading")).toBeVisible();
            expect(this.dialog.$(".instance select")).not.toBeVisible();
        });

        context("when the instance list fetch completes", function() {
            beforeEach(function() {
                this.dialog.instances.loaded = true;
                this.dialog.instances.reset(fixtures.instance());
            });

            it("displays the 'select instance' placeholder", function() {
                expect(this.dialog.$(".instance select option:eq(0)").text()).toMatchTranslation("sandbox.select_instance");
            });

            it("renders the dropdown for instances", function() {
                expect(this.dialog.$(".instance select")).toBeVisible();
                expect(this.dialog.$(".instance select option:eq(1)").text()).toBe(this.dialog.instances.models[0].get('name'));
            });

            it("hides the loading placeholder", function() {
                expect(this.dialog.$(".instance .loading")).not.toBeVisible();
            })

            context("choosing an instance", function() {
                beforeEach(function() {
                    var select = this.dialog.$(".instance select");
                    select.prop("selectedIndex", 1);
                    select.change();
                    this.selectedInstance = this.dialog.instances.get(this.dialog.$('.instance select option:selected').val());
                });

                it("displays the loading placeholder for databases", function() {
                    expect(this.dialog.$(".database .loading").text()).toMatch(t("loading"));
                    expect(this.dialog.$(".database .loading")).toBeVisible();
                    expect(this.dialog.$(".database select")).not.toBeVisible();
                });

                it("fetches the list of databases", function() {
                    expect(this.server.requests[1].url).toMatch("/edc/instance/" + this.selectedInstance.get('id') + "/database");
                });

                context("when the database list fetch completes", function() {
                    beforeEach(function() {
                        this.dialog.databases.loaded = true;
                        this.dialog.databases.reset(fixtures.database());
                    });

                    it("displays the 'select database' placeholder", function() {
                        expect(this.dialog.$(".database select option:eq(0)").text()).toMatchTranslation("sandbox.select_database");
                    });

                    it("renders the dropdown for databases", function() {
                        expect(this.dialog.$(".database select")).toBeVisible();
                        expect(this.dialog.$(".database select option:eq(1)").text()).toBe(this.dialog.databases.models[0].get('name'));
                    });

                    it("hides the loading placeholder", function() {
                        expect(this.dialog.$(".database .loading")).not.toBeVisible();
                    });

                    context("choosing a database", function() {
                        beforeEach(function() {
                            var select = this.dialog.$(".database select");
                            select.prop("selectedIndex", 1);
                            select.change();
                            this.selectedDatabase = this.dialog.databases.get(this.dialog.$('.database select option:selected').val());
                        });

                        it("displays the loading placeholder for schemas", function() {
                            expect(this.dialog.$(".schema .loading").text()).toMatch(t("loading"));
                            expect(this.dialog.$(".schema .loading")).toBeVisible();
                            expect(this.dialog.$(".schema select")).not.toBeVisible();
                        });

                        it("fetches the list of databases", function() {
                            expect(this.server.requests[2].url).toMatch("/edc/instance/" + this.selectedInstance.get('id') + "/database/" + this.selectedDatabase.get("id") + "/schema");
                        });

                        context("when the schema list fetch completes", function() {
                            beforeEach(function() {
                                this.dialog.schemas.loaded = true;
                                this.dialog.schemas.reset(fixtures.schema());
                            });

                            it("displays the 'select schema' placeholder", function() {
                                expect(this.dialog.$(".schema select option:eq(0)").text()).toMatchTranslation("sandbox.select_schema");
                            });

                            it("renders the dropdown for schemas", function() {
                                expect(this.dialog.$(".schema select")).toBeVisible();
                                expect(this.dialog.$(".schema select option:eq(1)").text()).toBe(this.dialog.schemas.models[0].get('name'));
                            });

                            it("hides the loading placeholder", function() {
                                expect(this.dialog.$(".schema .loading")).not.toBeVisible();
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
                            });
                        });
                    });
                });
            });
        });
    })
})
