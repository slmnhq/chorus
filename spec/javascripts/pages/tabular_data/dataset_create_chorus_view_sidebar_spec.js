describe("chorus.views.CreateChorusViewSidebar", function() {
    beforeEach(function() {
        this.dataset = newFixtures.datasetSandboxTable({objectName : "My_table"});
        this.dataset.columns().reset([fixtures.databaseColumn(), fixtures.databaseColumn(), fixtures.databaseColumn()]);
        var aggregateColumnSet = new chorus.collections.DatabaseColumnSet();
        aggregateColumnSet.reset(this.dataset.columns().models);
        this.view = new chorus.views.CreateChorusViewSidebar({model: this.dataset, aggregateColumnSet: aggregateColumnSet});
        this.chorusView = this.view.chorusView;
        this.modals = stubModals();
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("displays correct title", function() {
            expect(this.view.$("legend").text().trim()).toMatchTranslation("dataset.chorusview.sidebar.title")
        });

        it("adds a reference to the parent to the preview SQL link's data", function() {
           expect(this.view.$("a.preview").data("parent")).toBe(this.view);
        });

        it("gives a reference to the aggregateColumnSet to the chorus view", function() {
            expect(this.chorusView.aggregateColumnSet).toBeDefined();
            expect(this.chorusView.aggregateColumnSet).toBe(this.view.options.aggregateColumnSet);
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

        it("always enables the create chorus view button", function() {
            expect(this.view.$("button.create")).not.toBeDisabled();
        });

        context("when there are no filters or columns selected", function() {
            it("says 'no columns selected' beneath the table name", function() {
                expect(this.view.$(".no_columns_selected")).not.toHaveClass("hidden");
                expect(this.view.$(".no_columns_selected")).toContainTranslation('dataset.chorusview.sidebar.no_columns_selected');
            });
        })

        context("when a join is added to the chorus view", function() {
            beforeEach(function() {
                this.otherDataset = newFixtures.datasetSandboxTable();
                this.otherDataset.columns().reset([fixtures.databaseColumn()]);
                this.dataset.columns().models[0].tabularData.aliasedName="a";
                this.chorusView.addJoin(this.dataset.columns().models[0], this.otherDataset.columns().models[0], 'inner');
            });

            it("shows up in the sidebar", function() {
                expect(this.view.$(".dataset").length).toBe(2);
                expect(this.view.$(".dataset:eq(1) .name")).toContainText(this.otherDataset.get("objectName"));
            })

            it("displays the correct aliasedName for source and destination columns", function() {
                expect(this.view.$(".joins .letter:eq(0)")).toContainText(this.chorusView.joins[0].sourceColumn.tabularData.aliasedName);
                expect(this.view.$(".joins .letter:eq(1)")).toContainText(this.chorusView.joins[0].destinationColumn.tabularData.aliasedName);
            });

            context("removing the join", function() {
                beforeEach(function() {
                    spyOn(this.chorusView, "removeJoin");
                    this.view.$(".join .delete").click();
                })

                it("pops up an alert", function() {
                    expect(chorus.modal).toBeA(chorus.alerts.RemoveJoinConfirmAlert);
                    expect(chorus.modal.options.dataset).toBe(this.otherDataset);
                    expect(chorus.modal.options.chorusView).toBe(this.chorusView);
                })

                context("confirming the dialog", function() {
                    beforeEach(function() {
                        chorus.modal.$('button.submit').click();
                    })

                    it("removes the join", function() {
                        expect(this.chorusView.removeJoin).toHaveBeenCalledWith(this.otherDataset)
                    })
                })
            })
        });

        describe("column:selected event", function() {
            beforeEach(function(){
                this.databaseColumn = this.dataset.columns().models[0];
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

            describe("selecting another column", function() {
                beforeEach(function(){
                    this.databaseColumn2 = this.dataset.columns().models[1];
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
                    });
                });
            });
        });

        describe("column:select all", function() {
            beforeEach(function() {
                var column1 = this.dataset.columns().models[0];
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
                this.column1 = this.dataset.columns().models[0];

                this.joinedDataset = newFixtures.datasetSandboxTable();
                this.joinedColumns = this.joinedDataset.columns();
                this.joinedColumns.reset([fixtures.databaseColumn(), fixtures.databaseColumn()]);
                this.column2 = this.joinedColumns.models[0];

                this.chorusView.addJoin(this.column1, this.column2, 'inner');

                chorus.PageEvents.broadcast("column:selected", this.column1);
                chorus.PageEvents.broadcast("column:selected", this.column2);
                this.view.render();
                this.view.$("a.remove").eq(0).click();
            })

            it("should trigger the column:removed event", function() {
                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("column:removed", this.column1);
            })

            it("displays only the one remaining column", function() {
                expect(this.view.$(".columns li").length).toBe(1);
            });

            context("clicking the 'Remove' link for a joined column", function() {
                beforeEach(function() {
                    this.view.$("a.remove").eq(0).click();
                })

                it("removes the column", function() {
                    expect(this.view.$(".columns li").length).toBe(0);
                });
            })
        })

        describe("#whereClause", function() {
            beforeEach(function() {
                this.view.filters = { whereClause: function() {return "FOO"} }
            })

            it("creates a where clause from the supplied filters", function() {
                expect(this.view.whereClause()).toBe("FOO");
            });
        });

        describe("#sql", function() {
            beforeEach(function() {
                spyOn(this.view.chorusView, "generateSelectClause").andReturn("foo");
                spyOn(this.view.chorusView, "generateFromClause").andReturn("bar");
                spyOn(this.view, "whereClause").andReturn("baz");
            })

            it("should return the concatenated sql string", function() {
                expect(this.view.sql()).toBe("foo\nbar\nbaz");
            })
        });

        it("displays the preview SQL link", function() {
            expect(this.view.$("a.preview").text()).toContainTranslation("dataset.preview_sql");
        });

        describe("clicking 'preview sql'", function() {
            beforeEach(function() {
                spyOn(this.view, 'sql').andReturn("I add the where clause right now.");
                this.view.$("a.preview").click();
            });

            it("launches a preview sql dialog with the chorus view as its model", function() {
                var lastModal = this.modals.lastModal();
                expect(lastModal).toBeA(chorus.dialogs.SqlPreview);
                expect(lastModal.model).toBe(this.view.chorusView);
            });

            it("sets the right sql on the chorus view", function() {
                var lastModal = this.modals.lastModal();
                expect(lastModal.model.get("query")).toBe(this.view.sql());
            });
        });

        describe("clicking 'Create Dataset'", function() {
            beforeEach(function() {
                chorus.PageEvents.broadcast("column:selected", this.dataset.columns().models[0]);
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
                expect(this.chorusView.get("objectName")).toMatch(/chorus_My_table_\d+/)
            })
        })
    });

    describe("#cleanup", function() {
        beforeEach(function() {
            this.view.options.aggregateColumnSet.at(0).selected = true;
            this.view.cleanup();
        })

        it("unselects all columns", function() {
            expect(this.view.options.aggregateColumnSet.all(function(column) {return !column.selected})).toBeTruthy();
        })
    })
});
