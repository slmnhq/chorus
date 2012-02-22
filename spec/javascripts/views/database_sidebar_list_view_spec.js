describe("chorus.views.DatabaseSidebarList", function() {
    context("when there is no schema", function() {
        beforeEach(function() {
            this.view = new chorus.views.DatabaseSidebarList({schema: undefined });
            this.view.className = "database_function_sidebar_list";
        })

        describe("#setup", function() {
            it("should not crash", function() {
                expect(this.view).toBeDefined()
            })
        })

        describe("render", function() {
            beforeEach(function() {
                this.view.render();
            })

            it("should not crash", function() {
                expect($(this.view.el)).toHaveClass("database_function_sidebar_list");
            })
        })
    })

    context("when there is a schema", function() {
        beforeEach(function() {
            var object0 = new chorus.models.DatabaseObject();
            var object1 = new chorus.models.DatabaseObject();
            object0.cid = 'c44';
            object1.cid = 'c55';

            this.schema = fixtures.sandbox({ schemaName: "righteous_tables" }).schema();
            this.collection = new chorus.collections.Base([object0, object1]);

            spyOn(this.collection.models[0], 'toText').andReturn('object1');
            spyOn(this.collection.models[1], 'toText').andReturn('object2');
            this.view = new chorus.views.DatabaseSidebarList({collection: this.collection, schema: this.schema });
            this.view.className = "database_dataset_sidebar_list";
        });

        it("fetches the schemas", function() {
            expect(this.server.lastFetchFor(this.schema.database().schemas())).toBeDefined();
        })

        context("when the fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.schema.database().schemas(), [
                    this.schema,
                    fixtures.schema({ name: "awesome_tables", id: "5" }),
                    fixtures.schema({ name: "orphaned_tables", id: "6" })
                ]);
            });

            context("render", function() {
                beforeEach(function() {
                    this.schemaMenuQtip = stubQtip(".context a");
                    this.insertArrowQtip = stubQtip("li");
                    spyOn(this.view, 'closeQtip');
                    this.view.render();
                });

                context("after schemas have loaded", function() {
                    beforeEach(function() {
                        this.server.completeFetchFor(this.schema.database().schemas(), [
                            this.schema,
                            fixtures.schema({ name: "awesome_tables", id: "5" }),
                            fixtures.schema({ name: "orphaned_tables", id: "6" })
                        ]);
                        this.view.render();
                    });

                    describe("selecting a schema", function() {
                        beforeEach(function() {
                            spyOn(this.view, 'fetchResourceAfterSchemaSelected');
                            this.view.$(".context a").click();
                        });

                        it("opens a chorus menu", function() {
                            expect(this.schemaMenuQtip).toHaveVisibleQtip();
                        });

                        it("shows a check mark next to the current schema", function() {
                            expect(this.view.$("li:contains('righteous_tables')")).toContain('.check')
                            expect(this.view.$("li:contains('awesome_tables')")).not.toContain('.check')
                        })

                        it("shows the names of all of the workspace's database's schemas", function() {
                            expect(this.schemaMenuQtip.find("li").length).toBe(3);
                            expect(this.schemaMenuQtip).toContainText("righteous_tables");
                            expect(this.schemaMenuQtip).toContainText("awesome_tables");
                            expect(this.schemaMenuQtip).toContainText("orphaned_tables");
                        });

                        describe("when a schema is clicked", function() {
                            beforeEach(function() {
                                this.schemaMenuQtip.find("a[data-id=5]").click()
                                this.otherSchema = this.view.schemas.get("5");
                            });

                            it("calls the 'fetchResourceAfterSchemaSelected' hook", function() {
                                expect(this.view.fetchResourceAfterSchemaSelected).toHaveBeenCalled();
                            });
                        });
                    });
                });

                context("when hovering over a collection li", function() {
                    beforeEach(function() {
                        this.collection.trigger("reset");
                        this.view.$('.list li:eq(1)').mouseenter();
                    });

                    it("has the insert text in the insert arrow", function() {
                        expect(this.insertArrowQtip.find("a")).toContainTranslation('database.sidebar.insert')
                    })

                    context("when clicking the insert arrow", function() {
                        beforeEach(function() {
                            spyOn(chorus.PageEvents, "broadcast").andCallThrough();
                            this.insertArrowQtip.find("a").click()
                        })

                        it("broadcasts a file:insertText with the string representation", function() {
                            expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:insertText", this.view.collection.models[1].toText());
                        })
                    })

                    context("when clicking a link within the li", function() {
                        beforeEach(function() {
                            this.view.$('.list li:eq(1) a').click()
                        })

                        it("closes the open insert arrow", function() {
                            expect(this.view.closeQtip).toHaveBeenCalled();
                        })
                    });

                    context("when scrolling", function() {
                        beforeEach(function() {
                            chorus.page = new chorus.pages.Base();
                            chorus.page.sidebar = new chorus.views.Sidebar();

                            this.view.render();
                            chorus.page.sidebar.trigger("scroll");
                        });

                        it("closes the open insert arrow", function() {
                            expect(this.view.closeQtip).toHaveBeenCalled();
                        });
                    });
                })
            });

            describe("event handling", function() {
                describe("workfile:executed", function() {
                    beforeEach(function() {
                        this.server.reset();
                    });

                    context("when the execution schema is the same as the view's schema", function() {
                        beforeEach(function() {
                            chorus.PageEvents.broadcast("workfile:executed", fixtures.workfile(), this.schema.attributes)
                        });

                        it("does not fetch anything", function() {
                            expect(this.server.fetches().length).toBe(0);
                        })
                    })

                    context("when the execution schema is not the same as the view's schema", function() {
                        beforeEach(function() {
                            this.executionSchema = fixtures.schema();
                            chorus.PageEvents.broadcast("workfile:executed", fixtures.workfile(), this.executionSchema)
                        });

                        it("fetches the execution schema", function() {
                            expect(this.server.lastFetchFor(this.executionSchema.database().schemas())).toBeDefined();
                        })
                    })
                })
            })
        });
    })
})
