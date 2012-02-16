describe("chorus.dialogs.ManageJoinTables", function() {
    beforeEach(function() {
        var dataset = fixtures.datasetSourceTable({id : "abc", name: "original" });
        this.schema = dataset.schema();

        this.dialog = new chorus.dialogs.ManageJoinTables({ pageModel: dataset });
        this.dialog.render();
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
                objectType: "VIEW"
            });

            this.databaseObject2 = fixtures.databaseObject({
                objectName: "dogs",
                columns: 22,
                type: "SOURCE_TABLE",
                objectType: "BASE_TABLE"
            });

            this.originalDatabaseObject = fixtures.databaseObject({
                objectName: "original",
                columns: 23,
                type: "SOURCE_TABLE",
                objectType: "BASE_TABLE",
                id: "abc"
            });

            this.databaseObject3 = fixtures.databaseObject({
                objectName: "lions",
                columns: 24,
                type: "SOURCE_TABLE",
                objectType: "VIEW"
            });

            this.server.completeFetchFor(this.schema.databaseObjects(), [
                this.databaseObject1,
                this.databaseObject2,
                this.originalDatabaseObject,
                this.databaseObject3
            ]);
        });

        it("shows the name of each table/view", function() {
            expect(this.dialog.$(".name").eq(0)).toHaveText("cats");
            expect(this.dialog.$(".name").eq(1)).toHaveText("dogs");
            expect(this.dialog.$(".name").eq(2)).toHaveText("lions");
        });

        it("shows the column count for each table/view", function() {
            var columnCounts = this.dialog.$(".column_count");
            expect(columnCounts.eq(0).text().trim()).toMatchTranslation("dataset.manage_join_tables.column_count_plural", { count: 21 });
            expect(columnCounts.eq(1).text().trim()).toMatchTranslation("dataset.manage_join_tables.column_count_plural", { count: 22 });
        });

        it("shows the small dataset icon for each table/view", function() {
            var icons = this.dialog.$("img.image");
            expect(icons.eq(0)).toHaveAttr("src", this.databaseObject1.iconUrl({ size: "small" }));
            expect(icons.eq(1)).toHaveAttr("src", this.databaseObject2.iconUrl({ size: "small" }));
        });

        it("doesn't display original the table/view", function() {
            expect(this.dialog.$(".name")).not.toContainText("original");
        })

        it("shows the original table canonical name", function() {
            expect(this.dialog.$(".canonical_name").text()).toBe(this.schema.canonicalName());
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
            });

            describe("when another table is clicked", function() {
                beforeEach(function() {
                    this.lis.eq(2).trigger("click");
                });

                it("un-highlights the first table and highlights the table that was just clicked", function() {
                    expect(this.lis.eq(0)).not.toHaveClass("selected");
                    expect(this.lis.eq(1)).not.toHaveClass("selected");
                    expect(this.lis.eq(2)).toHaveClass("selected");
                });
            });
        });
    });
});
