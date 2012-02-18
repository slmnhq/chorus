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
            expect(this.model.requirePattern).toHaveBeenCalledWith("objectName", /^[a-zA-Z][a-zA-Z0-9_]*/, undefined, "dataset.chorusview.validation.object_name_pattern");
        })
    });

    describe("addJoin", function() {
        beforeEach(function() {
            spyOnEvent(this.model, 'change');
            this.sourceColumn = this.sourceDataset.columns().models[0];
            this.destinationDataset = fixtures.datasetSandboxTable();
            this.destinationColumn = this.destinationDataset.columns().models[0];
            this.destinationColumn = this.sourceDataset.columns().models[0];
            this.model.addJoin(this.sourceColumn, this.destinationColumn, 'inner');
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
    })
});
