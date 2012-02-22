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
        this.chorusView.aggregateColumnSet = new chorus.collections.DatabaseColumnSet();

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

            it("should have a sourceColumnSelect with the aggregateColumnSet", function() {
                expect(this.dialog.sourceColumnsSelect.collection).toBe(this.chorusView.aggregateColumnSet);
            });

            it("should have showAliasedName on the source columns", function() {
                expect(this.dialog.sourceColumnsSelect.options.showAliasedName).toBeTruthy();
            });

            it("should have a destinationColumnSelect with the destinationObject's columns", function() {
                expect(this.dialog.destinationColumnsSelect.collection).toBe(this.destinationTable.columns());
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

            describe("adding the join", function() {
                beforeEach(function() {
                    spyOn(this.dialog.model, 'addJoin');
                    spyOn(this.dialog, 'closeModal');
                    this.sourceColumn = this.dialog.sourceColumnsSelect.getSelectedColumn();
                    this.destinationColumn = this.dialog.destinationColumnsSelect.getSelectedColumn();
                    this.joinType = this.dialog.$('select.join_type').val();
                    this.dialog.$("button.submit").click();
                });

                it("calls addJoin with the source column, destination column, and join type", function() {
                    expect(this.dialog.model.addJoin).toHaveBeenCalledWith(this.sourceColumn, this.destinationColumn, this.joinType);
                });

                it("closes the dialog", function() {
                    expect(this.dialog.closeModal).toHaveBeenCalled();
                });
            });
        });
    })
});
