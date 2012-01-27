describe("chorus.views.DatabaseSidebarList", function() {
    beforeEach(function() {
        var object0 = new chorus.models.DatabaseTable();
        var object1 = new chorus.models.DatabaseTable();
        object0.cid = 'c44';
        object1.cid = 'c55';

        this.sandbox = fixtures.sandbox({ schemaName: "righteous_tables" });
        this.schema = this.sandbox.schema();
        this.collection = new chorus.collections.Base([object0, object1]);

        spyOn(this.collection.models[0], 'toText').andReturn('object1');
        spyOn(this.collection.models[1], 'toText').andReturn('object2');
        this.view = new chorus.views.DatabaseSidebarList({collection: this.collection, sandbox: this.sandbox });
        this.view.className = "database_dataset_sidebar_list";
        this.schemaMenuQtip = stubQtip(".context a");
        this.insertArrowQtip = stubQtip("li");
    });

    context("render", function() {
        beforeEach(function() {
            spyOn(this.view, 'closeQtip');
            this.view.render();
        });

        context("after schemas have loaded", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.sandbox.database().schemas(), [
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
                    beforeEach(function(){
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
                    spyOnEvent(this.view, "file:insertText");
                    this.insertArrowQtip.find("a").click()
                })

                it("triggers a file:insertText with the string representation", function() {
                    expect("file:insertText").toHaveBeenTriggeredOn(this.view, [this.view.collection.models[1].toText()]);
                })
            })

            context("when clicking a link within the li", function() {
                beforeEach(function() {
                    this.view.$('.list li:eq(1) a').click()
                })

                it("closes the open insert arrow", function() {
                    expect(this.view.closeQtip).toHaveBeenCalled();
                })
            })

        })
    })
});
