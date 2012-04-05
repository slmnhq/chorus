describe("chorus.models.CSVImport", function() {

    describe("validation", function() {
        beforeEach(function() {
            this.model = fixtures.csvImport();
        });
        it("is valid with a valid toTable", function() {
            this.model.set({toTable: "a_happyTable123"});
            expect(this.model.performValidation()).toBeTruthy();
        })

        var badNames = [
            "6",
            "a table name",
            new Array(100).join("a"),
            ""
        ];

        _.each(badNames, function(name) {
            it("is invalid for a name of " + name, function() {
                this.model.set({toTable: name});
                expect(this.model.performValidation()).toBeFalsy();
            });
        }, this);
    });

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

    describe("it retains values the user has entered", function() {
        beforeEach(function() {
            this.model = fixtures.csvImport({
                lines: [
                    'col1,col2,col3,col4',
                    'foo,2,3,1/2/3',
                    'bar,2.1,sna,456'
                ]
            });
        })

        it("stores changes to the generated column names", function() {
            this.model.set({ generatedColumnNames: ["ggg", "ttt", "rrr", "eee"], hasHeader: false })
            var result = _.pluck(this.model.columnOrientedData(), "name")
            expect(result).toEqual(["ggg", "ttt", "rrr", "eee"])
        })

        it("stores changes to the header column names from the file", function() {
            this.model.set({ headerColumnNames: ["f", "d", "s", "a"], hasHeader: true })
            var result = _.pluck(this.model.columnOrientedData(), "name")
            expect(result).toEqual(["f", "d", "s", "a"])
        })
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

    describe("#normalizeForDatabase", function() {
        it("converts to lower case", function() {
            expect(chorus.models.CSVImport.normalizeForDatabase("FILENAME")).toBe("filename")
        });

        it("converts spaces to underscores", function() {
            expect(chorus.models.CSVImport.normalizeForDatabase("file name")).toBe("file_name")
        });

        it("converts periods to underscores", function() {
            expect(chorus.models.CSVImport.normalizeForDatabase("file.name")).toBe("file_name")
        });

        it("discards invalid characters", function() {
            expect(chorus.models.CSVImport.normalizeForDatabase("file^$name*&22_+33")).toBe("filename22_33")
        });

        it("truncates at 64 characters", function() {
            expect(chorus.models.CSVImport.normalizeForDatabase("0123456789012345678901234567890123456789012345678901234567890123456789")).toBe("0123456789012345678901234567890123456789012345678901234567890123")
        });
    })
})