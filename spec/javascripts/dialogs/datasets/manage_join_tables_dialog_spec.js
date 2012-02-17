describe("chorus.dialogs.ManageJoinTables", function() {
    beforeEach(function() {
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

    it("retrieves the chorus view model from the launch element", function() {
        expect(this.dialog.model).toBe(this.chorusView);
    });

    it("has the right title", function() {
        expect(this.dialog.$("h1").text()).toMatchTranslation("dataset.manage_join_tables.title");
    });

    it("fetches the schema's tables and views", function() {
        expect(this.schema.databaseObjects()).toHaveBeenFetched();
    });

    it("has a 'done' button", function() {
        expect(this.dialog.$("button.cancel").text()).toMatchTranslation("dataset.manage_join_tables.done");
    });

    describe("when the fetch of the tables and views completes", function() {
        beforeEach(function() {
            this.databaseObject1 = fixtures.databaseObject({
                objectName: "cats",
                columns: 21,
                type: "SOURCE_TABLE",
                objectType: "VIEW",
                id: "10000|dca_demo|ddemo|VIEW|cats"
            });

            this.databaseObject2 = fixtures.databaseObject({
                objectName: "dogs",
                columns: 22,
                type: "SOURCE_TABLE",
                objectType: "BASE_TABLE",
                id: "10000|dca_demo|ddemo|BASE_TABLE|dogs"
            });

            this.databaseObject3 = fixtures.databaseObject({
                objectName: "lions",
                columns: 24,
                type: "SOURCE_TABLE",
                objectType: "VIEW",
                id: "10000|dca_demo|ddemo|VIEW|lions"
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

        it("has a 'join table'/'join view' link for every database object", function() {
            var joinLinks = this.dialog.$("a.join");
            expect(joinLinks.eq(0).text().trim()).toMatchTranslation("dataset.manage_join_tables.join_view");
            expect(joinLinks.eq(1).text().trim()).toMatchTranslation("dataset.manage_join_tables.join_table");
            expect(joinLinks.eq(2).text().trim()).toMatchTranslation("dataset.manage_join_tables.join_view");
        });

        describe("when a 'join table' link is clicked", function() {
            beforeEach(function() {
                spyOn(chorus.dialogs.JoinConfiguration.prototype, 'render').andCallThrough();
                this.dialog.$("a.join").eq(2).trigger("click");
            });

            it("launches the 'join configuration' sub-dialog", function() {
                expect(chorus.dialogs.JoinConfiguration.prototype.render).toHaveBeenCalled();
            });

            it("passes the right chorus view and destination object to the JoinConfiguration dialog", function() {
                var joinConfigurationDialog = chorus.dialogs.JoinConfiguration.prototype.render.mostRecentCall.object;

                expect(joinConfigurationDialog.model).toBe(this.chorusView);

                expect(joinConfigurationDialog.destinationObject).toBeA(chorus.models.DatabaseObject);
                expect(joinConfigurationDialog.destinationObject.get("id")).toBe(this.databaseObject3.get("id"));
            });
        });
    });
});
