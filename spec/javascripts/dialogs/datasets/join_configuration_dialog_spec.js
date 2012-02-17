describe("chorus.dialogs.JoinConfiguration", function() {
    beforeEach(function() {
        this.sourceTable = fixtures.databaseTable();
        this.sourceTable.columns().reset([
            fixtures.databaseColumn({ name: "source_column_1" }),
            fixtures.databaseColumn({ name: "source_column_2" }),
            fixtures.databaseColumn({ name: "source_column_3" }),
            fixtures.databaseColumn({ name: "source_column_4" })
        ]);

        this.chorusView = this.sourceTable.deriveChorusView();

        this.destinationTable = fixtures.databaseObject({
            objectType: "SANDBOX_TABLE",
            objectName: "lions_den"
        });

        this.dialog = new chorus.dialogs.JoinConfiguration({
            model: this.chorusView,
            destinationObject: this.destinationTable
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
        });

        it("has the right title", function() {
            expect(this.dialog.$("h1").text()).toMatchTranslation("dataset.manage_join_tables.title");
        });

        it("should have a header", function() {
            expect(this.dialog.$('.sub_header .title').text()).toMatchTranslation("dataset.manage_join_tables.create_join_title", { objectName: "lions_den" })
        });

        it("fetches the columns in the destination table or view", function() {
            expect(this.destinationTable.columns()).toHaveBeenFetched();
        });

        describe("when the fetch completes for the destination table's columns", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.destinationTable.columns(), [
                    fixtures.databaseColumn({ name: "destination_column_1" }),
                    fixtures.databaseColumn({ name: "destination_column_2" }),
                    fixtures.databaseColumn({ name: "destination_column_3" })
                ]);
            });

            it("should have a 'source join column' select", function() {
                expect(this.dialog.$('select.source_join_column')).toExist()
            });

            it("should have a 'destination join column' select", function() {
                expect(this.dialog.$('select.destination_join_column')).toExist()
            });

            it("should have an option in the destination column select for every column fetched", function() {
                var destinationOptions = this.dialog.$("select.destination_join_column option");

                expect(destinationOptions.length).toBe(3);
                expect(destinationOptions.eq(0).text()).toBe("destination_column_1");
                expect(destinationOptions.eq(1).text()).toBe("destination_column_2");
                expect(destinationOptions.eq(2).text()).toBe("destination_column_3");
            });

            it("should have an option in the source column select for all of the source dataset's columns", function() {
                var sourceOptions = this.dialog.$("select.source_join_column option");

                expect(sourceOptions.length).toBe(4);
                expect(sourceOptions.eq(0).text()).toBe("source_column_1");
                expect(sourceOptions.eq(1).text()).toBe("source_column_2");
                expect(sourceOptions.eq(2).text()).toBe("source_column_3");
                expect(sourceOptions.eq(3).text()).toBe("source_column_4");
            });
        });
    })
});
