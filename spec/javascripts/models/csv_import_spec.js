describe("chorus.models.CSVImport", function() {

    it("has the right url", function() {
        this.model = fixtures.csvImport({workspaceId: "23"})
        expect(this.model.url()).toBe("/edc/workspace/23/csv/import");

    })
    context("with comma delimiters", function() {
        beforeEach(function() {
            this.model = fixtures.csvImport({
                lines: [
                    "col1,col2,col3",
                    "row1val1,row1val2,row1val3",
                    "row2val1,row2val2,row2val3"
                ]
            });
            this.expectedColumns = [
                {name: 'col1', values: ['row1val1', 'row2val1'], type: 'text'},
                {name: 'col2', values: ['row1val2', 'row2val2'], type: 'text'},
                {name: 'col3', values: ['row1val3', 'row2val3'], type: 'text'}
            ]
        })

        itParsesCorrectly();
    })

    context("with space delimiters", function() {
        beforeEach(function() {
            this.model = fixtures.csvImport({
                lines: [
                    'col1 col2 col3',
                    '"row1 val1" row1val2 row1val3',
                    'row2val1 "row2 val2" row2val3'
                ]
            });
            this.expectedColumns = [
                {name: 'col1', values: ['row1 val1', 'row2val1'], type: 'text'},
                {name: 'col2', values: ['row1val2', 'row2 val2'], type: 'text'},
                {name: 'col3', values: ['row1val3', 'row2val3'], type: 'text'}
            ]
            this.model.set({'delimiter': ' '});
        })

        itParsesCorrectly();
    })

    context("with tab delimiters", function() {
        beforeEach(function() {
            this.model = fixtures.csvImport({
                lines: [
                    "col1\tcol2\tcol3",
                    "row1val1\trow1val2\trow1val3",
                    "row2val1\trow2val2\trow2val3"
                ]
            });
            this.expectedColumns = [
                {name: 'col1', values: ['row1val1', 'row2val1'], type: 'text'},
                {name: 'col2', values: ['row1val2', 'row2val2'], type: 'text'},
                {name: 'col3', values: ['row1val3', 'row2val3'], type: 'text'}
            ]
            this.model.set({'delimiter': '\t'});
        })

        itParsesCorrectly();
    })

    context("with quoted comma", function() {
        beforeEach(function() {
            this.model = fixtures.csvImport({
                lines: [
                    'col1,col2,col3',
                    '"row1,val1",row1val2,row1val3',
                    'row2val1,"row2,val2",row2val3'
                ]
            });
            this.expectedColumns = [
                {name: 'col1', values: ['row1,val1', 'row2val1'], type: 'text'},
                {name: 'col2', values: ['row1val2', 'row2,val2'], type: 'text'},
                {name: 'col3', values: ['row1val3', 'row2val3'], type: 'text'}
            ]
        })

        itParsesCorrectly();
    })

    context("with escaped quote", function() {
        beforeEach(function() {
            this.model = fixtures.csvImport({
                lines: [
                    'col1,col2,col3',
                    '"row1""val1",row1val2,""""',
                    'row2val1,"row2val2",row2val3'
                ]
            });
            this.expectedColumns = [
                {name: 'col1', values: ['row1"val1', 'row2val1'], type: 'text'},
                {name: 'col2', values: ['row1val2', 'row2val2'], type: 'text'},
                {name: 'col3', values: ['"', 'row2val3'], type: 'text'}
            ]
        })

        itParsesCorrectly();
    })

    context("with empty values", function() {
        beforeEach(function() {
            this.model = fixtures.csvImport({
                lines: [
                    'col1,col2,col3',
                    '"row1""val1",row1val2,',
                    'row2val1,,row2val3'
                ]
            });

            this.expectedColumns = [
                {name: 'col1', values: ['row1"val1', 'row2val1'], type: 'text'},
                {name: 'col2', values: ['row1val2', ''], type: 'text'},
                {name: 'col3', values: ['', 'row2val3'], type: 'text'}
            ]
        });

        itParsesCorrectly()
    })

    context("with unparseable values (for current delimiter)", function() {
        beforeEach(function() {
            this.model = fixtures.csvImport({
                lines: [
                    '"col1 ""colly"" column",col2,col3',
                    '"row1""val1",row1val2,',
                    'row2val1,,row2val3'
                ]
            });
            this.model.set({'delimiter': ' '});
        });

        it("returns an empty array and sets serverErrors", function() {
            var columns = this.model.columnOrientedData();
            expect(columns).toEqual([]);
            expect(this.model.serverErrors.length).toBe(1);
        });

        it("clears server errors when it parses correctly", function() {
            this.model.columnOrientedData();
            expect(this.model.serverErrors.length).toBe(1);
            this.model.set({'delimiter': ','});
            var columns = this.model.columnOrientedData();
            expect(columns.length).toBe(3);
            expect(this.model.serverErrors).toBeUndefined();
        })
    });

    context("datatypes", function() {
        beforeEach(function() {
            this.model = fixtures.csvImport({
                lines: [
                    'col1,col2,col3,col4',
                    'foo,2,3,1/2/3',
                    'bar,2.1,sna,456'
                ]
            });
            this.expectedColumns = [
                {name: 'col1', values: ['foo', 'bar'], type: 'text'},
                {name: 'col2', values: ['2', '2.1'], type: 'float'},
                {name: 'col3', values: ['3', 'sna'], type: 'text'},
                {name: 'col4', values: ['1/2/3', '456'], type: 'text'}
            ]
        });

        itParsesCorrectly();
    })

    context("no header row", function() {
        beforeEach(function() {
            this.model = fixtures.csvImport({
                hasHeader: false,
                lines: [
                    'foo,2,3,1/2/3',
                    'bar,2.1,sna,456'
                ]
            });
            this.expectedColumns = [
                {name: 'column_1', values: ['foo', 'bar'], type: 'text'},
                {name: 'column_2', values: ['2', '2.1'], type: 'float'},
                {name: 'column_3', values: ['3', 'sna'], type: 'text'},
                {name: 'column_4', values: ['1/2/3', '456'], type: 'text'}
            ]
        });

        itParsesCorrectly();
    })

    function itParsesCorrectly() {
        describe("columnOrientedData", function() {
            beforeEach(function() {
                this.columns = this.model.columnOrientedData();
                this.types = _.pluck(this.columns, "type")
            })

            it("has the correct number of columns", function() {
                expect(this.columns.length).toBe(this.expectedColumns.length);
            })

            it("has the column name", function() {
                expect(this.columns[0].name).toBe(this.expectedColumns[0].name);
            })

            it("has the correct number of data types", function() {
                expect(this.types).toEqual(_.pluck(this.expectedColumns, "type"));

            })

            it("has the rows", function() {
                _.each(this.columns, _.bind(function(column, i) {
                    expect(column.values).toEqual(this.expectedColumns[i].values)
                }, this))
            })

        })
    }
})