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

            it("should have a header", function() {
                expect(this.dialog.$('.sub_header .title').text()).toMatchTranslation("dataset.manage_join_tables.create_join_title", { objectName: "lions_den" })
            });

            it("should have a sourceColumnSelect with the sourceObject's columns", function() {
                expect(this.dialog.sourceColumnsSelect.collection).toBe(this.sourceTable.columns());
            });

            it("should have showDatasetNumbers on the source columns", function() {
                expect(this.dialog.sourceColumnsSelect.options.showDatasetNumbers).toBeTruthy();
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

            it("should have a select for type of join", function() {
                expect(this.dialog.$('select.join_type')).toExist()
                var joinTypes = this.dialog.$('select.join_type option')

                expect(joinTypes.length).toBe(4)
                expect(joinTypes.eq(0).text()).toMatchTranslation("dataset.manage_join_tables.inner")
                expect(joinTypes.eq(1).text()).toMatchTranslation("dataset.manage_join_tables.left")
                expect(joinTypes.eq(2).text()).toMatchTranslation("dataset.manage_join_tables.right")
                expect(joinTypes.eq(3).text()).toMatchTranslation("dataset.manage_join_tables.outer")
            })

            it("should have a save button", function() {
                expect(this.dialog.$("button.submit").text()).toMatchTranslation("actions.save_changes")
            })

            it("should have a cancel button", function() {
                expect(this.dialog.$("button.cancel").text()).toMatchTranslation("actions.cancel")
            })
        });
    })
});
