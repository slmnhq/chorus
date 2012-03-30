describe("chorus.dialogs.ManageJoinTables", function() {
    beforeEach(function() {
        this.qtip = stubQtip();
        stubModals();
        this.originalDatabaseObject = fixtures.databaseObject({
            objectName: "original",
            columns: 23,
            type: "SOURCE_TABLE",
            objectType: "BASE_TABLE",
            id: "abc"
        });
        var dataset = fixtures.datasetSourceTable({
            objectName: "original",
            columns: 23,
            type: "SOURCE_TABLE",
            objectType: "BASE_TABLE",
            id: "abc"
        });

        this.schema = dataset.schema();
        this.chorusView = dataset.deriveChorusView();

        var launchElement = $("<a class='add_join'></a>").data("chorusView", this.chorusView);

        this.dialog = new chorus.dialogs.ManageJoinTables({ pageModel: dataset, launchElement: launchElement });
        this.dialog.render();
        $("#jasmine_content").append(this.dialog.el);
    });

    it("sets urlParams rows=", function() {
        expect(this.dialog.collection.urlParams().rows).toBe(9);
    });

    it("retrieves the chorus view model from the launch element", function() {
        expect(this.dialog.model).toBe(this.chorusView);
    });

    it("has the right title", function() {
        expect(this.dialog.$("h1").text()).toMatchTranslation("dataset.manage_join_tables.title");
    });

    it("fetches the schema's tables and views", function() {
        expect(this.schema.databaseObjects()).toHaveBeenFetched();
    });

    describe("when the fetch of the tables and views completes", function() {
        beforeEach(function() {
            this.databaseObject1 = fixtures.databaseObject({
                objectName: "cats",
                columns: 21,
                type: "SOURCE_TABLE",
                objectType: "VIEW",
                id: '"10000"|"dca_demo"|"ddemo"|"VIEW"|"cats"'
            });

            this.databaseObject2 = fixtures.databaseObject({
                objectName: "dogs",
                columns: 22,
                type: "SOURCE_TABLE",
                objectType: "BASE_TABLE",
                id: '"10000"|"dca_demo"|"ddemo"|"BASE_TABLE"|"dogs"'
            });

            this.databaseObject3 = fixtures.databaseObject({
                objectName: "lions",
                columns: 24,
                type: "SOURCE_TABLE",
                objectType: "VIEW",
                id: '"10000"|"dca_demo"|"ddemo"|"VIEW"|"lions"'
            });

            this.server.completeFetchFor(this.schema.databaseObjects(), [
                this.databaseObject1,
                this.databaseObject2,
                this.originalDatabaseObject,
                this.databaseObject3
            ]);
        });

        it("has a 'done' button", function() {
            expect(this.dialog.$("button.cancel").text()).toMatchTranslation("dataset.manage_join_tables.done");
        });

        it("shows the name of each table/view", function() {
            expect(this.dialog.$(".name").eq(0)).toHaveText("cats");
            expect(this.dialog.$(".name").eq(1)).toHaveText("dogs");
            expect(this.dialog.$(".name").eq(2)).toHaveText("original");
            expect(this.dialog.$(".name").eq(3)).toHaveText("lions");
        });

        it("shows the column count for each table/view", function() {
            var columnCounts = this.dialog.$(".column_count");
            expect(columnCounts.eq(0).text().trim()).toMatchTranslation("dataset.manage_join_tables.column_count_plural", { count: 21 });
            expect(columnCounts.eq(1).text().trim()).toMatchTranslation("dataset.manage_join_tables.column_count_plural", { count: 22 });
        });

        it("shows the medium dataset icon for each table/view", function() {
            var icons = this.dialog.$("img.image");
            expect(icons.eq(0)).toHaveAttr("src", this.databaseObject1.iconUrl({ size: "medium" }));
            expect(icons.eq(1)).toHaveAttr("src", this.databaseObject2.iconUrl({ size: "medium" }));
        });

        describe("database/instance/schema", function() {
            it("shows the original table canonical name", function() {
                expect(this.dialog.$(".canonical_name").text()).toBe(this.schema.canonicalName());
            });

            it("the schema is a link to a drop-down menu", function() {
                var $link = this.dialog.$(".canonical_name a.schema_qtip")
                expect($link).toContainText(this.schema.get("name"));
            });

            describe("opening the schema-picker", function() {
                beforeEach(function() {
                    this.dialog.$(".canonical_name a.schema_qtip").click();
                    this.server.completeFetchFor(this.dialog.schemas, [fixtures.schema({name: "Bob"}), this.schema, fixtures.schema({name: "Ted"})]);
                });

                it("clicking the link shows the schema-picker", function() {
                    expect(this.qtip).toHaveVisibleQtip();
                    expect(this.qtip.find("ul li").length).toBe(3);
                });

                it("schema-picker has a check-mark beside the currently selected schema", function() {
                     expect(this.qtip.$("li:contains('" + this.schema.get("name") + "')")).toContain('.check');
                     expect(this.qtip.$("li:contains(Bob)")).not.toContain('.check');
                });

                context("when selecting a schema", function() {
                    beforeEach(function() {
                        this.qtip.$("li:contains(Bob) a").click();
                    });

                    it("hides the menu", function() {
                        expect(this.qtip).not.toHaveVisibleQtip();
                    });

                    it("loads the schema's datasets", function() {

                    });

                    it("shows the loading spinner until the datasets have loaded", function() {
                    });

                });
            });
        });

        describe("when a table is clicked", function() {
            beforeEach(function() {
                this.lis = this.dialog.$("li");
                this.lis.eq(1).trigger("click");
            });

            it("highlights the table", function() {
                expect(this.lis.eq(0)).not.toHaveClass("selected");
                expect(this.lis.eq(1)).toHaveClass("selected");
                expect(this.lis.eq(2)).not.toHaveClass("selected");
                expect(this.lis.eq(3)).not.toHaveClass("selected");
            });

            describe("when another table is clicked", function() {
                beforeEach(function() {
                    this.lis.eq(3).trigger("click");
                });

                it("un-highlights the first table and highlights the table that was just clicked", function() {
                    expect(this.lis.eq(0)).not.toHaveClass("selected");
                    expect(this.lis.eq(1)).not.toHaveClass("selected");
                    expect(this.lis.eq(2)).not.toHaveClass("selected");
                    expect(this.lis.eq(3)).toHaveClass("selected");
                });
            });
        });

        it("has a 'join table'/'join view' link for every database object", function() {
            var joinLinks = this.dialog.$("a.join");
            expect(joinLinks.eq(0).text().trim()).toMatchTranslation("dataset.manage_join_tables.join_view");
            expect(joinLinks.eq(1).text().trim()).toMatchTranslation("dataset.manage_join_tables.join_table");
            expect(joinLinks.eq(2).text().trim()).toMatchTranslation("dataset.manage_join_tables.join_table");
            expect(joinLinks.eq(3).text().trim()).toMatchTranslation("dataset.manage_join_tables.join_view");
        });

        it("has a 'preview columns' link for every dataset object", function() {
            var links = this.dialog.$("a.preview_columns");
            expect(links.length).toBe(4);
            expect(links.eq(0).text()).toMatchTranslation("dataset.manage_join_tables.preview_columns");
        });

        describe("when a 'preview columns' link is clicked", function() {
            beforeEach(function() {
                spyOn(chorus.dialogs.PreviewColumns.prototype, 'render').andCallThrough();
                this.dialog.$("a.preview_columns").eq(1).trigger("click");
            });

            it("launches the 'preview columns' sub-dialog", function() {
                expect(chorus.dialogs.PreviewColumns.prototype.render).toHaveBeenCalled();
            });

            it("passes the right table or view to the 'preview columns' sub-dialog", function() {
                var previewColumnsDialog = chorus.dialogs.PreviewColumns.prototype.render.mostRecentCall.object;
                expect(previewColumnsDialog.model).toBeA(chorus.models.DatabaseObject);
                expect(previewColumnsDialog.model.get("id")).toBe(this.databaseObject2.get("id"));
            });
        });

        describe("when a 'join table' link is clicked", function() {
            beforeEach(function() {
                spyOn(chorus.dialogs.JoinConfiguration.prototype, 'render').andCallThrough();
                var link = this.dialog.$("a.join").eq(3)
                link.trigger("click");
                var clickedId = link.closest('li').data('cid')
                this.selectedDataset = this.dialog.collection.getByCid(clickedId);
            });

            it("launches the 'join configuration' sub-dialog", function() {
                expect(chorus.dialogs.JoinConfiguration.prototype.render).toHaveBeenCalled();
            });

            it("passes the right chorus view and destination object to the JoinConfiguration dialog", function() {
                var joinConfigurationDialog = chorus.dialogs.JoinConfiguration.prototype.render.mostRecentCall.object;

                expect(joinConfigurationDialog.model).toBe(this.chorusView);

                expect(joinConfigurationDialog.destinationObject).toBeA(chorus.models.DatabaseObject);
                expect(joinConfigurationDialog.destinationObject.get("id")).toBe(this.databaseObject3.get("id"));
                expect(joinConfigurationDialog.destinationObject).not.toBe(this.selectedDataset);
            });
        });

        describe("when there are many tables to join", function() {
            it("shows pagination controls", function() {
                expect(this.dialog.$(".list_content_details")).toBeHidden();
                expect(this.dialog.$(".list_content_details .count")).toContainText("4");
                expect(this.server.lastFetchFor(this.schema.databaseObjects()).url).toContain("rows=9")
            })
        });
    });
});
