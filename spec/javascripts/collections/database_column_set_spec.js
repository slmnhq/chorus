describe("chorus.collections.DatabaseColumnSet", function() {
    describe("database table column", function() {
        beforeEach(function() {
            var table = newFixtures.dataset.sandboxTable({
                instance: {
                    id: '2',
                    name: 'instance2'
                },
                databaseName: 'db1',
                schemaName: 'schema1',
                objectName: 'table1',
                id: '1'
            });
            this.columns = table.columns();
        });

        it("has the correct urlTemplate", function() {
            expect(this.columns.url()).toContain("/database_objects/1/columns");
        })

        describe("add", function() {
            it("sets tabularData on the added column", function() {
                this.columns.add(fixtures.databaseColumn());
                expect(this.columns.models[0].tabularData).toBe(this.columns.attributes.tabularData);
            })

            it("calls initialize on the column", function() {
                var column = fixtures.databaseColumn()
                spyOn(column, 'initialize').andCallThrough();
                this.columns.add(column);
                expect(column.initialize).toHaveBeenCalled();
            })
        });
    });

    describe("database view column", function() {
        beforeEach(function() {
            var view = newFixtures.dataset.sandboxView({
                instance: {
                    id: '2',
                    name: 'instance2'
                },
                databaseName: 'db1',
                schemaName: 'schema1',
                objectName: 'view1',
                id: '3'
            })
            this.columns = view.columns();
        });

        it("has the correct urlTemplate", function() {
            expect(this.columns.url()).toContain("/database_objects/3/columns");
        })

        context("when the names need to be url encoded", function() {
            beforeEach(function() {
                var table = newFixtures.dataset.sandboxView({
                    instance: {
                        id: '2',
                        name: '%foo%'
                    },
                    databaseName: 'b/a/r',
                    schemaName: ' baz ',
                    objectName: '!!!',
                    id: '4'
                });
                this.columns = table.columns();
            });

            it("should url encode the appropriate entities", function() {
                expect(this.columns.url()).toContain("/database_objects/4/columns");
            });
        });

    });

    describe("database chorus view column", function() {
        beforeEach(function() {
            var chorusView = newFixtures.dataset.chorusView({
                workspace: {
                    id: '10'
                },
                id: '5'
            })
            this.columns = chorusView.columns();
        })

        it("has the correct urlTemplate", function() {
            expect(this.columns.url()).toMatchUrl('/database_objects/5/columns', {paramsToIgnore: ['page', 'rows']});
        })
    })

    describe("#urlParams", function() {
        context("when type attribute is meta", function() {
            beforeEach(function() {
                this.columns = newFixtures.dataset.sandboxView().columns({type: "meta"});
            });

            it("should include the 'type' parameter in the url", function() {
                expect(this.columns.urlParams().type).toBe("meta");
            });
        });

        context("when type attribute is unspecified", function() {
            beforeEach(function() {
                this.columns = newFixtures.dataset.sandboxView().columns();
            });

            it("should not include the 'type' parameter in the url", function() {
                expect(this.columns.urlParams().type).toBeFalsy();
            });
        });
    });

    describe("sorting", function() {
        context("without dataset", function() {
            beforeEach(function() {
                this.columns = new chorus.collections.DatabaseColumnSet();
                this.firstColumn = fixtures.databaseColumn({ordinalPosition: 1});
                this.secondColumn = fixtures.databaseColumn({ordinalPosition: 2});
                this.columns.add(this.secondColumn);
                this.columns.add(this.firstColumn);
            })
            it("should be ordered by ordinalPosition", function() {
                expect(this.columns.models).toEqual([this.firstColumn, this.secondColumn]);
            });
        });

        context("with multiple dataset", function() {
            beforeEach(function() {
                this.columns = new chorus.collections.DatabaseColumnSet();
                this.dataset1 = newFixtures.dataset.sandboxTable();
                this.dataset1.datasetNumber = 1;
                this.dataset1Columns = this.dataset1.columns();
                this.dataset1Columns.reset([fixtures.databaseColumn({ordinalPosition: 1}), fixtures.databaseColumn({ordinalPosition: 2}), fixtures.databaseColumn({ordinalPosition: 3})]);
                this.dataset2 = newFixtures.dataset.sandboxTable();
                this.dataset2.datasetNumber = 2;
                this.dataset2Columns = this.dataset2.columns()
                this.dataset2Columns.reset([fixtures.databaseColumn({ordinalPosition: 1}), fixtures.databaseColumn({ordinalPosition: 2})]);
                this.columns.add(this.dataset1Columns.models);
                this.columns.add(this.dataset2Columns.models);
            });

            it("sorts first by datasetNumber, then by ordinalPosition", function() {
                expect(_.pluck(this.columns.models, 'cid')).toEqual(_.pluck((this.dataset1Columns.models.concat(this.dataset2Columns.models)), 'cid'));
            });
        });
    });
});
