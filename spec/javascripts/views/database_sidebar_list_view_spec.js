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
                chorus.page = new chorus.pages.DatasetShowPage(1, 2);
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

            this.schema = newFixtures.sandbox({ schemaName: "righteous_tables" }).schema();
            this.collection = new chorus.collections.Base([object0, object1]);

            spyOn(this.collection.models[0], 'toText').andReturn('object1');
            spyOn(this.collection.models[1], 'toText').andReturn('object2');
            this.view = new chorus.views.DatabaseSidebarList({collection: this.collection, schema: this.schema });
            this.view.className = "database_dataset_sidebar_list";
            spyOn(this.view, "postRender").andCallThrough();
            this.view.render();
        });

        it("fetches the schemas", function() {
            expect(this.server.lastFetchFor(this.schema.database().schemas())).toBeDefined();
        });

        it("does not render", function() {
            expect(this.view.postRender).not.toHaveBeenCalled();
        });

        context("when the fetch completes", function() {
            beforeEach(function() {
                this.qtip = stubQtip(".context a");
                spyOn(this.view, 'closeQtip');

                this.server.completeFetchFor(this.schema.database().schemas(), [
                    this.schema,
                    fixtures.schema({ name: "awesome_tables", id: "5" }),
                    fixtures.schema({ name: "orphaned_tables", id: "6" })
                ]);
            });

            it("renders", function() {
               expect(this.view.postRender).toHaveBeenCalled();
            });
            context("selecting a schema", function() {
                beforeEach(function() {
                    spyOn(this.view, 'fetchResourceAfterSchemaSelected');
                    this.view.$(".context a").click();
                });

                it("opens a chorus menu", function() {
                    expect(this.qtip).toHaveVisibleQtip();
                });

                it("shows a check mark next to the current schema", function() {
                    expect(this.view.$("li:contains('righteous_tables')")).toContain('.check')
                    expect(this.view.$("li:contains('awesome_tables')")).not.toContain('.check')
                })

                it("shows the names of all of the workspace's database's schemas", function() {
                    var $lis = this.qtip.find("li a");
                    expect($lis.length).toBe(4);
                    expect($lis.eq(0)).toContainText("this workspace");
                    expect($lis.eq(1)).toContainText("awesome_tables");
                    expect($lis.eq(2)).toContainText("orphaned_tables");
                    expect($lis.eq(3)).toContainText("righteous_tables");
                });

                describe("when a schema is clicked", function() {
                    beforeEach(function() {
                        this.qtip.find("a[data-id=5]").click()
                        this.otherSchema = this.view.schemas.get("5");
                    });

                    it("calls the 'fetchResourceAfterSchemaSelected' hook", function() {
                        expect(this.view.fetchResourceAfterSchemaSelected).toHaveBeenCalled();
                    });
                });
            });

            describe("event handling", function() {
                describe("workfile:executed", function() {
                    beforeEach(function() {
                        this.server.reset();
                    });

                    context("when the execution schema is the same as the view's schema", function() {
                        beforeEach(function() {
                            this.executionSchema = _.clone(this.schema.attributes);
                            this.executionSchema.schemaName = this.executionSchema.name;
                            delete this.executionSchema.name;
                            delete this.executionSchema.id;
                            chorus.PageEvents.broadcast("workfile:executed", fixtures.workfile(), this.executionSchema)
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
