describe("chorus.views.CreateChorusViewSidebar", function() {
    beforeEach(function() {
        this.dataset = fixtures.datasetChorusView({objectName : "my_chorus"});
        this.view = new chorus.views.CreateChorusViewSidebar({model: this.dataset});
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

        it("disables the create button by default", function() {
            expect(this.view.$("button.create")).toBeDisabled();
        });

        context("when there are no filters or columns selected", function() {
            it("hides the non-empty selection section and shows the empty selection section", function() {
                expect(this.view.$(".selected_columns .non_empty_selection")).toHaveClass("hidden");
                expect(this.view.$(".selected_columns .empty_selection")).not.toHaveClass("hidden");
            });

            it("display the default message title", function() {
                expect(this.view.$(".selected_columns .empty_selection .top label").text().trim()).toMatchTranslation("dataset.chorusview.sidebar.empty_selection.title");
            })

            it("display the default message", function() {
                expect(this.view.$(".selected_columns .empty_selection .bottom ").text().trim()).toMatchTranslation("dataset.chorusview.sidebar.empty_selection.text");
            })

            it("disabled the create dataset button", function() {
                expect(this.view.$("button.create")).toBeDisabled();
            });
        })

        describe("column:selected event", function() {
            beforeEach(function(){
                this.databaseColumn = fixtures.databaseColumn();
                chorus.PageEvents.broadcast("column:selected", this.databaseColumn);
            });

            it("displays the name of that column", function() {
                expect(this.view.$(".empty_selection")).toHaveClass("hidden");
                expect(this.view.$(".non_empty_selection")).not.toHaveClass("hidden");
                expect(this.view.$(".non_empty_selection .columns li").length).toBe(1)
                expect(this.view.$(".non_empty_selection .columns li")).toContainText(this.databaseColumn.get("name"));
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
                    expect(this.view.$(".non_empty_selection .columns li").length).toBe(2)
                    expect(this.view.$(".non_empty_selection .columns li")).toContainText(this.databaseColumn.get("name"));
                    expect(this.view.$(".non_empty_selection .columns li")).toContainText(this.databaseColumn2.get("name"));
                });

                describe("deselecting one column", function() {
                    beforeEach(function(){
                        chorus.PageEvents.broadcast("column:deselected", this.databaseColumn);
                    });

                    it("removes the name of that column", function() {
                        expect(this.view.$(".empty_selection")).toHaveClass("hidden");
                        expect(this.view.$(".non_empty_selection")).not.toHaveClass("hidden");
                        expect(this.view.$(".non_empty_selection .columns li").length).toBe(1)
                    });

                    describe("deselecting the other column", function() {
                        beforeEach(function(){
                            chorus.PageEvents.broadcast("column:deselected", this.databaseColumn2);
                        });

                        it("removes the name of that column, and displays the empty selection div", function() {
                            expect(this.view.$(".empty_selection")).not.toHaveClass("hidden");
                            expect(this.view.$(".non_empty_selection")).toHaveClass("hidden");
                            expect(this.view.$(".non_empty_selection .columns li").length).toBe(0)
                        });

                        it("disables the create button", function() {
                            expect(this.view.$("button.create")).toBeDisabled();
                        });
                    });
                });
            });
        });

        describe("clicking the 'Remove' link", function() {
            beforeEach(function() {
                spyOn(chorus.PageEvents, "broadcast").andCallThrough();
                this.column1 = fixtures.databaseColumn();
                chorus.PageEvents.broadcast("column:selected", this.column1);
                this.column2 = fixtures.databaseColumn();
                chorus.PageEvents.broadcast("column:selected", this.column2);
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
                    this.column2 = fixtures.databaseColumn({name: "Bar"});
                    chorus.PageEvents.broadcast("column:selected", this.column1);
                    chorus.PageEvents.broadcast("column:selected", this.column2);
                });

                it("should build a select clause from the selected columns", function() {
                    expect(this.view.selectClause()).toBe("SELECT Foo, Bar");
                });
            });
        });

        describe("#fromClause", function() {
            it("should return the dataset name in the FROM clause", function() {
                expect(this.view.fromClause()).toBe("FROM my_chorus");
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
                this.view.$("button.create").click();
            });

            it("puts the create button in a loading state", function() {
                expect(this.view.$("button.create").isLoading()).toBeTruthy();
            });

            it("should create the chorus view", function() {
                var workspaceId = this.dataset.get("workspace").id;
                expect(this.server.lastCreate().url).toContain("/edc/workspace/" + workspaceId + "/dataset");

                // placeholder - name doesn't have a way to be set from UI yet
                var params = this.server.lastCreate().params();
                delete params.objectName;
                expect(params).toEqual({
                    type: "CHORUS_VIEW",
                    query: "SELECT * FROM FOO",
                    instanceId: this.dataset.get("instance").id.toString(),
                    databaseName: this.dataset.get("databaseName"),
                    schemaName: this.dataset.get("schemaName"),
                    objectType: "QUERY"
                });
                expect(this.server.lastCreate().method).toBe("POST");
            });

            context("after the request fails", function() {
                beforeEach(function() {
                    spyOn(chorus, 'toast');
                    this.server.lastCreate().fail();
                });

                it("displays a toast", function() {
                    expect(chorus.toast).toHaveBeenCalled();
                });

                it("removes the loading spinner from the button", function() {
                    expect(this.view.$("button.create").isLoading()).toBeFalsy();
                });
            });

            context("after the request completes successfully", function() {
                beforeEach(function() {
                    spyOn(chorus, 'toast');
                    this.server.lastCreate().succeed();
                });

                it("displays a toast", function() {
                    expect(chorus.toast).toHaveBeenCalled();
                });

                it("removes the loading spinner from the button", function() {
                    expect(this.view.$("button.create").isLoading()).toBeFalsy();
                });
            });
        })
    });
});