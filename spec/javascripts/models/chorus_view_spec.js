describe("chorus.models.ChorusView", function() {
    beforeEach(function() {
        this.sourceDataset = fixtures.datasetSandboxTable();
        this.sourceDataset.columns().reset([fixtures.databaseColumn(), fixtures.databaseColumn(), fixtures.databaseColumn()])
        this.model = this.sourceDataset.deriveChorusView();
        this.model.aggregateColumnSet = new chorus.collections.DatabaseColumnSet(this.sourceDataset.columns().models);
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
            this.destinationColumn = addJoin(this, this.sourceColumn);
            this.destinationDataset = this.destinationColumn.tabularData;
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

        it("adds the destination dataset's columns to the aggregate column set", function() {
            expect(this.model.aggregateColumnSet.models).toContain(this.destinationColumn);
            this.destinationDataset.columns().each(_.bind(function(column) {
                expect(this.model.aggregateColumnSet.models).toContain(column);
            }, this));
        });
    });

    describe("addColumn", function() {
        beforeEach(function() {
            spyOnEvent(this.model, 'change');
            this.column = this.sourceDataset.columns().models[0];
            spyOnEvent(this.column, 'change');
            this.model.addColumn(this.column);
        })

        it("has the column", function() {
            expect(this.model.sourceObjectColumns).toContain(this.column);
        })

        it("triggers change on the model", function() {
            expect('change').toHaveBeenTriggeredOn(this.model);
        })

        it("marks the column as selected", function() {
            expect(this.column.selected).toBeTruthy();
        })

        it("triggers change on the column", function() {
            expect('change').toHaveBeenTriggeredOn(this.column);
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

        context("for a column on a join", function() {
            beforeEach(function() {
                this.joinedColumn = addJoin(this, this.sourceColumn);
                this.model.addColumn(this.joinedColumn);
                this.join = this.model.joins[0];
            });

            it("adds the column to the column list of the join", function() {
                expect(this.join.columns).toContain(this.joinedColumn);
            })
            describe("removeColumn", function() {
                beforeEach(function() {
                    resetBackboneEventSpies(this.model);
                    expect(this.join.columns.length).toBe(1)
                    this.model.removeColumn(this.joinedColumn);
                })

                it("removes the column", function() {
                    expect(this.join.columns.length).toBe(0)
                })

                it("triggers change on the model", function() {
                    expect('change').toHaveBeenTriggeredOn(this.model);
                })
            })
        });

        describe("removeColumn", function() {
            context("with a column that exists", function() {

                beforeEach(function() {
                    resetBackboneEventSpies(this.model);
                    resetBackboneEventSpies(this.column);
                    this.model.removeColumn(this.column);
                })

                it("removes the column", function() {
                    expect(this.model.sourceObjectColumns.length).toBe(0);
                })

                it("triggers change on the model", function() {
                    expect('change').toHaveBeenTriggeredOn(this.model);
                })

                it("marks the column as not selected", function() {
                    expect(this.column.selected).toBeFalsy();
                })

                it("triggers change on the column", function() {
                    expect('change').toHaveBeenTriggeredOn(this.column);
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
                expect(lines[1]).toBe('\tINNER JOIN ' + this.firstJoinedColumn.tabularData.fromClause() + ' ON '
                    + this.sourceColumn.quotedName() + " = " + this.firstJoinedColumn.quotedName());
            })
        })
    });

    describe("valid", function() {
        context("when there are no columns selected", function() {
            it("is not valid", function() {
                expect(this.model.valid()).toBeFalsy();
            })
        })

        context("when there are sourceDataset columns selected", function() {
            beforeEach(function() {
                this.model.addColumn(this.sourceDataset.columns().models[0]);
            })

            it("is valid", function() {
                expect(this.model.valid()).toBeTruthy();
            })
        })

        context("when there are join columns selected", function() {
            beforeEach(function() {
                var joinedColumn = addJoin(this);
                this.model.addColumn(joinedColumn);
            })

            it("is valid", function() {
                expect(this.model.valid()).toBeTruthy();
            })
        })
    })

    describe("#selectClause", function() {
        context("when no columns are selected", function() {
            it("returns 'SELECT *'", function() {
                expect(this.model.selectClause()).toBe("SELECT *");
            });
        });

        context("when two columns are selected", function() {
            beforeEach(function() {
                this.column1 = fixtures.databaseColumn({name: "Foo"});
                this.column2 = fixtures.databaseColumn({name: "bar"});
                this.sourceDataset.columns().reset([this.column1, this.column2]);
                this.model.addColumn(this.column1);
                this.model.addColumn(this.column2);
            });

            it("should build a select clause from the selected columns", function() {
                var tableName = this.sourceDataset.selectName();
                expect(this.model.selectClause()).toBe('SELECT ' + tableName + '."Foo", ' + tableName + '.bar');
            });

            context("when selecting a joined column", function() {
                beforeEach(function() {
                    var joinedColumn = addJoin(this);
                    joinedColumn.set({name: 'baz'});
                    this.joinedDataset = joinedColumn.tabularData;
                    this.model.addColumn(joinedColumn);
                });

                it("has the joined columns too", function() {
                    var tableName = this.sourceDataset.selectName();
                    var joinedTableName = this.joinedDataset.selectName();
                    expect(this.model.selectClause()).toBe('SELECT ' + tableName + '."Foo", ' + tableName + '.bar, ' + joinedTableName + '.baz');
                });
            });
        });
    });

    function addJoin(self, sourceColumn) {
        sourceColumn || (sourceColumn = self.sourceDataset.columns().models[0]);
        var joinedDataset = fixtures.datasetSandboxTable();
        joinedDataset.columns().reset([fixtures.databaseColumn(), fixtures.databaseColumn()]);
        var joinedColumn = joinedDataset.columns().models[0];
        self.model.addJoin(sourceColumn, joinedColumn, 'inner');
        return joinedColumn;
    }
});
