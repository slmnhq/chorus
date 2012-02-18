describe("chorus.views.CreateChorusViewSidebar", function() {
    beforeEach(function() {
        this.dataset = fixtures.datasetSandboxTable({objectName : "My_table"});
        this.view = new chorus.views.CreateChorusViewSidebar({model: this.dataset});
        this.chorusView = this.view.chorusView;
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("displays correct title", function() {
            expect(this.view.$("legend").text().trim()).toMatchTranslation("dataset.chorusview.sidebar.title")
        });

        it("displays the preview SQL link", function() {
            expect(this.view.$("a.preview")).toExist();
            expect(this.view.$("a.preview")).toHaveClass("dialog");
            expect(this.view.$("a.preview").data("dialog")).toBe("SqlPreview");
            expect(this.view.$("a.preview").text()).toContainTranslation("dataset.preview_sql");
        });

        it("adds a reference to the parent to the preview SQL link's data", function() {
           expect(this.view.$("a.preview").data("parent")).toBe(this.view);
        });

        describe("the 'add a join' link", function() {
            var addJoinLink;

            beforeEach(function() {
                addJoinLink = this.view.$("a.add_join");
            });

            it("has the right text", function() {
                expect(addJoinLink.text()).toMatchTranslation("dataset.chorusview.sidebar.add_join");
            });

            it("launches a 'manage join tables' dialog", function() {
                expect(addJoinLink).toHaveData("dialog", "ManageJoinTables");
            });

            it("has a reference to a chorus view derived from the current dataset", function() {
                var chorusView = addJoinLink.data("chorusView");
                expect(chorusView).toBeA(chorus.models.ChorusView);
                expect(chorusView.sourceObject).toBe(this.dataset);
            });
        });

        it("disables the create button by default", function() {
            expect(this.view.$("button.create")).toBeDisabled();
        });

        context("when there are no filters or columns selected", function() {
            it("says 'no columns selected' beneath the table name", function() {
                expect(this.view.$(".no_columns_selected")).not.toHaveClass("hidden");
                expect(this.view.$(".no_columns_selected")).toContainTranslation('dataset.chorusview.sidebar.no_columns_selected');
            });
        })

        describe("column:selected event", function() {
            beforeEach(function(){
                this.databaseColumn = fixtures.databaseColumn();
                chorus.PageEvents.broadcast("column:selected", this.databaseColumn);
            });

            it("displays the name of that column", function() {
                expect(this.view.$(".columns li").length).toBe(1)
                expect(this.view.$(".columns li")).toContainText(this.databaseColumn.get("name"));
            });

            it("includes a remove link in the li", function() {
                expect(this.view.$(".columns li a.remove")).toExist();
                expect(this.view.$(".columns li a.remove").text().trim()).toMatchTranslation("dataset.chorusview.sidebar.remove");
            })

            it("enables the create button", function() {
                expect(this.view.$("button.create")).not.toBeDisabled();
            });

            describe("selecting another column", function() {
                beforeEach(function(){
                    this.databaseColumn2 = fixtures.databaseColumn();
                    chorus.PageEvents.broadcast("column:selected", this.databaseColumn2);
                });

                it("adds that column too", function() {
                    expect(this.view.$(".columns li").length).toBe(2)
                    expect(this.view.$(".columns li")).toContainText(this.databaseColumn.get("name"));
                    expect(this.view.$(".columns li")).toContainText(this.databaseColumn2.get("name"));
                });

                describe("deselecting one column", function() {
                    beforeEach(function(){
                        chorus.PageEvents.broadcast("column:deselected", this.databaseColumn);
                    });

                    it("removes the name of that column", function() {
                        expect(this.view.$(".columns li").length).toBe(1)
                    });

                    describe("deselecting the other column", function() {
                        beforeEach(function(){
                            chorus.PageEvents.broadcast("column:deselected", this.databaseColumn2);
                        });

                        it("removes the name of that column, and displays the no columns div", function() {
                            expect(this.view.$(".no_columns_selected")).not.toHaveClass("hidden");
                            expect(this.view.$(".columns li").length).toBe(0)
                        });

                        it("disables the create button", function() {
                            expect(this.view.$("button.create")).toBeDisabled();
                        });
                    });
                });
            });
        });

        describe("column:select all", function() {
            beforeEach(function() {
                var column1 = fixtures.databaseColumn();
                chorus.PageEvents.broadcast("column:selected", column1);
                chorus.PageEvents.broadcast("column:selected", column1);
            });

            it("should not show duplicate columns", function() {
                expect(this.view.$(".columns li").length).toBe(1)
            });
        });

        describe("clicking the 'Remove' link", function() {
            beforeEach(function() {
                spyOn(chorus.PageEvents, "broadcast").andCallThrough();
                this.column1 = fixtures.databaseColumn();
                chorus.PageEvents.broadcast("column:selected", this.column1);
                this.column2 = fixtures.databaseColumn();
                chorus.PageEvents.broadcast("column:selected", this.column2);
                this.dataset.columns().reset([this.column1, this.column2])
                this.view.render();
                this.view.$("a.remove").eq(0).click();
            })

            it("should trigger the column:removed event", function() {
                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("column:removed", this.column1);
            })

            it("displays only the one remaining column", function() {
                expect(this.view.$(".columns li").length).toBe(1);
            });
        })

        describe("#whereClause", function() {
            beforeEach(function() {
                this.view.filters = { whereClause: function() {return "FOO"} }
            })

            it("creates a where clause from the supplied filters", function() {
                expect(this.view.whereClause()).toBe("FOO");
            });
        });

        describe("#selectClause", function() {
            context("when no columns are selected", function() {
                it("returns 'SELECT *'", function() {
                    expect(this.view.selectClause()).toBe("SELECT *");
                });
            });

            context("when two columns are selected", function() {
                beforeEach(function() {
                    this.column1 = fixtures.databaseColumn({name: "Foo"});
                    this.column2 = fixtures.databaseColumn({name: "bar"});
                    chorus.PageEvents.broadcast("column:selected", this.column1);
                    chorus.PageEvents.broadcast("column:selected", this.column2);
                });

                it("should build a select clause from the selected columns", function() {
                    expect(this.view.selectClause()).toBe("SELECT \"My_table\".\"Foo\", \"My_table\".bar");
                });
            });
        });

        describe("#fromClause", function() {
            it("should return the dataset name in the FROM clause", function() {
                expect(this.view.fromClause()).toBe("FROM \"My_table\"");
            });
        });

        describe("#sql", function() {
            beforeEach(function() {
                spyOn(this.view, "selectClause").andReturn("foo");
                spyOn(this.view, "fromClause").andReturn("bar");
                spyOn(this.view, "whereClause").andReturn("baz");
            })

            it("should return the concatenated sql string", function() {
                expect(this.view.sql()).toBe("foo\nbar\nbaz");
            })
        });

        describe("clicking 'Create Dataset'", function() {
            beforeEach(function() {
                chorus.PageEvents.broadcast("column:selected", fixtures.databaseColumn());
                spyOn(this.view, "sql").andReturn("SELECT * FROM FOO");
                this.launchModalSpy = jasmine.createSpy("launchModal")
                spyOn(chorus.dialogs, "NameChorusView").andCallFake(_.bind(function(options) {
                    this.chorusView = options.model;
                    return {
                        launchModal: this.launchModalSpy
                    }
                }, this));
                this.view.$("button.create").click();
            });

            it("constructs a ChorusView and reveals the naming dialog", function() {
                expect(chorus.dialogs.NameChorusView).toHaveBeenCalled()
                expect(this.launchModalSpy).toHaveBeenCalled();
                expect(this.chorusView.get("type")).toBe("CHORUS_VIEW")
                expect(this.chorusView.get("query")).toBe("SELECT * FROM FOO");
                expect(this.chorusView.get("instanceId")).toBe(this.dataset.get("instance").id);
                expect(this.chorusView.get("databaseName")).toBe(this.dataset.get("databaseName"));
                expect(this.chorusView.get("schemaName")).toBe(this.dataset.get("schemaName"));
                expect(this.chorusView.get("objectType")).toBe("QUERY");
            })
        })
    });
});
