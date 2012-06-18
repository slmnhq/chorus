describe("chorus.views.DatabaseFunctionSidebarList", function() {
    beforeEach(function() {
        this.schema = rspecFixtures.workspace({ sandboxInfo: { name: "righteous_tables" } }).sandbox().schema();
        this.modalSpy = stubModals();
        spyOn(this.schema.functions(), "fetch").andCallThrough();
        this.view = new chorus.views.DatabaseFunctionSidebarList({schema: this.schema});
    });

    it("should fetch the functions for the sandbox", function() {
        expect(this.schema.functions().fetch).toHaveBeenCalled();
    });

    it("should set the functionSet as the resource", function() {
        expect(this.view.resource).toBe(this.schema.functions());
    })

    describe("render", function() {
        context("when there's no schema associated", function() {
            beforeEach(function() {
                this.view = new chorus.views.DatabaseFunctionSidebarList({schema: null});
                this.view.render();
            });

            it("should display 'no database/schema associated' message", function() {
                expect(this.view.$(".empty_selection")).toExist();
            })

            it("should not display the loading section", function() {
                expect(this.view.$(".loading_section")).not.toExist();
            })
        });

        context("when schema is associated", function() {
            beforeEach(function() {
                this.menu = stubQtip(".context a");
                this.view.render();
                $('#jasmine_content').append(this.view.el);
            });

            it("should show the loading section", function() {
                expect(this.view.$('.loading_section')).toExist();
            });

            it("should not display 'no database/schema associated' message", function() {
                expect(this.view.$(".empty_selection")).not.toExist();
            })

            it("fetches all of the schemas in the sandbox's database", function() {
                expect(this.server.lastFetchFor(this.schema.database().schemas())).toBeTruthy();
            });

            context("after functions and schemas have loaded", function() {
                beforeEach(function() {
                    this.server.completeFetchFor(this.schema.database().schemas(), [
                        this.schema,
                        rspecFixtures.schema({ name: "awesome_tables", id: "5" }),
                        rspecFixtures.schema({ name: "orphaned_tables", id: "6" })
                    ]);

                    this.server.completeFetchFor(this.view.collection, [
                        fixtures.schemaFunction({ functionName: "laplace_transform" }),
                        fixtures.schemaFunction({ functionName: "inc" })
                    ]);
                });

                itBehavesLike.DatabaseSidebarList();

                it("should not show the loading section", function() {
                    expect(this.view.$('.loading_section')).not.toExist();
                });

                it("should have the correct search placeholder text", function() {
                    expect(this.view.$("input.search").attr("placeholder")).toMatchTranslation("schema.functions.list.hint");
                })

                it("should render the functions", function() {
                    expect(this.view.$("ul li")).toContainText("laplace_transform");
                    expect(this.view.$("ul li")).toContainText("inc");
                });

                it("should not show the 'no functions found' text", function() {
                    expect(this.view.$('.none_found')).not.toExist();
                });

                it("should display the current schema name", function() {
                    expect(this.view.$('.context')).toContainText("righteous_tables");
                })

                describe("selecting a schema", function() {
                    beforeEach(function() {
                        this.view.$(".context a").click();
                    });

                    it("opens a chorus menu", function() {
                        expect(this.menu).toHaveVisibleQtip();
                    });

                    it("shows a check mark next to the current schema", function() {
                        expect(this.view.$("li:contains('righteous_tables')")).toContain('.check')
                        expect(this.view.$("li:contains('awesome_tables')")).not.toContain('.check')
                    })

                    it("shows the names of all of the workspace's database's schemas", function() {
                        expect(this.menu.find("li").length).toBe(3);
                        expect(this.menu).toContainText("righteous_tables");
                        expect(this.menu).toContainText("awesome_tables");
                        expect(this.menu).toContainText("orphaned_tables");
                    });

                    describe("when a schema is clicked", function() {
                        beforeEach(function() {
                            this.menu.find("a[data-id=5]").click()
                            this.otherSchema = this.view.schemas.get("5");
                        })

                        it("should fetch the functions for the new schema", function() {
                            expect(this.server.lastFetchFor(this.otherSchema.functions())).not.toBeUndefined()
                        });

                        it("should show the loading spinner", function() {
                            expect(this.view.$('.loading_section')).toExist();
                        });

                        describe("when the function fetch completes", function() {
                            beforeEach(function() {
                                this.server.completeFetchFor(this.view.collection, [
                                    fixtures.schemaFunction({ functionName: "fourier_transform" }),
                                    fixtures.schemaFunction({ functionName: "obnoxious_transform" })
                                ]);
                            });

                            it("removes the loading spinner", function() {
                                expect(this.view.$('.loading_section')).not.toExist();
                                expect(this.view.$(".none_found")).not.toExist()
                            });

                            it("shows the new schema name as context", function() {
                                expect(this.view.$(".context")).toContainText("awesome_tables")
                            })

                            it("shows the new functions in the sidebar", function() {
                                expect(this.view.$("ul")).toExist()

                                expect(this.view.$("ul li")).toContainText("fourier_transform");
                                expect(this.view.$("ul li")).toContainText("obnoxious_transform");
                                expect(this.view.$('ul li:eq(0) .name').attr('title')).toBe(this.view.collection.models[0].toHintText())
                            });
                        })
                    })
                });
            });

            context("when the functions fail to load", function() {
                beforeEach(function() {
                    this.server.completeFetchFor(this.schema.database().schemas(), [
                        this.schema,
                        rspecFixtures.schema({ name: "awesome_tables", id: "5" }),
                        rspecFixtures.schema({ name: "orphaned_tables", id: "6" })
                    ]);

                    this.server.lastFetchFor(this.view.collection).failForbidden([
                        {message: "Account map needed yo"}
                    ]);
                });

                it("does not show the loading spinner", function() {
                   expect(this.view.$(".loading_section")).not.toExist();
                });

                it("should display an option to enter credentials", function() {
                    expect(this.view.$('.no_credentials')).toExist();
                });

                it("launches the correct dialog when the 'click here' credentials link is clicked", function() {
                    this.view.$('.no_credentials .add_credentials').click();
                    expect(this.modalSpy).toHaveModal(chorus.dialogs.InstanceAccount);
                });
            });

            context("when the schema has no functions", function() {
                beforeEach(function() {
                    this.server.completeFetchFor(this.schema.database().schemas());
                    this.server.completeFetchFor(this.view.collection, []);
                });

                it("should show the 'no functions found' text", function() {
                    expect(this.view.$('.none_found')).toContainTranslation("schema.functions.none_found");
                });
            });
        })

    })
});
