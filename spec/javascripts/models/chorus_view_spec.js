describe("chorus.models.ChorusView", function() {
    beforeEach(function() {
        this.sourceDataset = fixtures.datasetSandboxTable();
        this.sourceDataset.columns().reset([fixtures.databaseColumn(), fixtures.databaseColumn(), fixtures.databaseColumn()])
        this.model = this.sourceDataset.deriveChorusView();
    });

    it("extends Dataset", function() {
        expect(this.model).toBeA(chorus.models.Dataset);
    });

    describe("validation", function() {
        beforeEach(function() {
            spyOn(this.model, "require").andCallThrough();
            spyOn(this.model, "requirePattern").andCallThrough();
        });

        it("requires an object name", function() {
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("objectName", undefined, "dataset.chorusview.validation.object_name_required");
        })

        it("enforces object name constraints", function() {
            this.model.performValidation();
            expect(this.model.requirePattern).toHaveBeenCalledWith("objectName", /^[a-zA-Z][a-zA-Z0-9_]*$/, undefined, "dataset.chorusview.validation.object_name_pattern");
        })
    });

    describe("addJoin", function() {
        beforeEach(function() {
            spyOnEvent(this.model, 'change');
            this.sourceColumn = this.sourceDataset.columns().models[0];
            this.destinationColumn = addJoin(this, this.sourceColumn    );
        });

        it("saves the table", function() {
            expect(this.model.joins.length).toBe(1);
            var join = this.model.joins[0];
            expect(join.sourceColumn).toBe(this.sourceColumn);
            expect(join.destinationColumn).toBe(this.destinationColumn);
            expect(join.joinType).toBe('inner');
        });

        it("triggers change on the model", function() {
            expect('change').toHaveBeenTriggeredOn(this.model);
        });

        it("assigns the join the next datasetNumber", function() {
            expect(this.destinationColumn.tabularData.datasetNumber).toBe(2);
            var thirdDestinationColumn = addJoin(this);
            expect(thirdDestinationColumn.tabularData.datasetNumber).toBe(3);
        });
    });

    describe("addColumn", function() {
        beforeEach(function() {
            spyOnEvent(this.model, 'change');
            this.column = this.sourceDataset.columns().models[0];
            this.model.addColumn(this.column);
        })

        it("has the column", function() {
            expect(this.model.columns).toContain(this.column);
        })

        it("triggers change on the model", function() {
            expect('change').toHaveBeenTriggeredOn(this.model);
        })

        context("for a column already added", function() {
            beforeEach(function() {
                resetBackboneEventSpies(this.model);
                this.model.addColumn(this.column);
            })

            it("prevents duplicates", function() {
                expect(this.model.columns.length).toBe(1);
            })

            it("does not trigger change on the model", function() {
                expect('change').not.toHaveBeenTriggeredOn(this.model);
            })
        })

        describe("removeColumn", function() {
            context("with a column that exists", function() {

                beforeEach(function() {
                    resetBackboneEventSpies(this.model);
                    this.model.removeColumn(this.column);
                })

                it("removes the column", function() {
                    expect(this.model.columns.length).toBe(0);
                })

                it("triggers change on the model", function() {
                    expect('change').toHaveBeenTriggeredOn(this.model);
                })
            })

            context("with a column that does not exists", function() {

                beforeEach(function() {
                    resetBackboneEventSpies(this.model);
                    this.model.removeColumn(this.sourceDataset.columns().models[1]);
                })

                it("does nothing to the columns", function() {
                    expect(this.model.columns.length).toBe(1);
                })

                it("does not trigger change on the model", function() {
                    expect('change').not.toHaveBeenTriggeredOn(this.model);
                })
            })
        })
    });

    describe("fromClause", function() {
        context("with only the base table", function() {
            it("has the proper from clause", function() {
                expect(this.model.fromClause()).toBe('FROM "' + this.sourceDataset.get('objectName') + '"');
            });
        });

        context("with a table joined in", function() {
            beforeEach(function() {
                this.sourceColumn = this.sourceDataset.columns().models[0];
                this.firstJoinedColumn = addJoin(this, this.sourceColumn);
            })

            it("has the second table joined in", function() {
                var lines = this.model.fromClause().split('\n');
                expect(lines[0]).toBe('FROM ' + this.sourceDataset.quotedName());
                expect(lines[1]).toBe('\tINNER JOIN ' + this.firstJoinedColumn.tabularData.quotedName() + ' ON '
                    + this.sourceColumn.quotedName() + " = " + this.firstJoinedColumn.quotedName());
            })
        })
    });

    function addJoin(self, sourceColumn) {
        sourceColumn || (sourceColumn = self.sourceDataset.columns().models[0]);
        var joinedDataset = fixtures.datasetSandboxTable();
        joinedDataset.columns().reset([fixtures.databaseColumn()]);
        var joinedColumn = joinedDataset.columns().models[0];
        self.model.addJoin(sourceColumn, joinedColumn, 'inner');
        return joinedColumn;
    }
});
