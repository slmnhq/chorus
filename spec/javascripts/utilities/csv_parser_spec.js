describe("chorus.utilities.CsvParser", function() {
    beforeEach(function() {
        this.options = {};

        this.contents = [
            "col1,col2,col3",
            "row1val1,row1val2,row1val3",
            "row2val1,row2val2,row2val3"
        ];
    });

    context("#generateHeaderNames", function() {
        it("generates column_1, column_2, ...", function() {
            var csvParser = new chorus.utilities.CsvParser(this.contents, this.options);
            expect(csvParser.generateHeaderNames()).toEqual(['column_1', 'column_2', 'column_3']);
        });
    });

    context("#parseHeaderNames", function() {
        it("gets the first row as the header", function() {
            var csvParser = new chorus.utilities.CsvParser(this.contents, this.options);
            expect(csvParser.parseHeaderNames()).toEqual(['col1', 'col2', 'col3']);
        });
    });

    context("#getColumnOrientedData", function() {
        context("with comma delimiters", function() {
            beforeEach(function() {
                this.contents = [
                    "col1,col2,col3",
                    "row1val1,row1val2,row1val3",
                    "row2val1,row2val2,row2val3"
                ];

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
                this.contents = [
                    'col1 col2 col3',
                    '"row1 val1" row1val2 row1val3',
                    'row2val1 "row2 val2" row2val3'
                ];

                this.expectedColumns = [
                    {name: 'col1', values: ['row1 val1', 'row2val1'], type: 'text'},
                    {name: 'col2', values: ['row1val2', 'row2 val2'], type: 'text'},
                    {name: 'col3', values: ['row1val3', 'row2val3'], type: 'text'}
                ]
                this.options.delimiter = ' ';
            })

            itParsesCorrectly();
        })

        context("with tab delimiters", function() {
            beforeEach(function() {
                this.contents = [
                    "col1\tcol2\tcol3",
                    "row1val1\trow1val2\trow1val3",
                    "row2val1\trow2val2\trow2val3"
                ];

                this.expectedColumns = [
                    {name: 'col1', values: ['row1val1', 'row2val1'], type: 'text'},
                    {name: 'col2', values: ['row1val2', 'row2val2'], type: 'text'},
                    {name: 'col3', values: ['row1val3', 'row2val3'], type: 'text'}
                ]
                this.options.delimiter = '\t';
            })

            itParsesCorrectly();
        })

        context("with quoted comma", function() {
            beforeEach(function() {
                this.contents = [
                    'col1,col2,col3',
                    '"row1,val1",row1val2,row1val3',
                    'row2val1,"row2,val2",row2val3'
                ];

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
                this.contents = [
                    'col1,col2,col3',
                    '"row1""val1",row1val2,""""',
                    'row2val1,"row2val2",row2val3'
                ];

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
                this.contents = [
                    'col1,col2,col3',
                    '"row1""val1",row1val2,',
                    'row2val1,,row2val3'
                ];


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
                this.contents = [
                    '"col1 ""colly"" column",col2,col3',
                    '"row1""val1",row1val2,',
                    'row2val1,,row2val3'
                ];

                this.options.delimiter = ' ';

                this.csvParser = new chorus.utilities.CsvParser(this.contents, this.options);
            });

            it("returns an empty array and sets serverErrors", function() {
                var columns = this.csvParser.getColumnOrientedData();
                expect(columns).toEqual([]);
                expect(_.keys(this.csvParser.serverErrors).length).toBe(1);
            });
        });

        context("datatypes", function() {
            beforeEach(function() {
                this.contents = [
                    'col1,col2,col3,col4',
                    'foo,2,3,1/2/3',
                    'bar,2.1,sna,456'
                ];

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
                this.contents = [
                    'foo,2,3,1/2/3',
                    'bar,2.1,sna,456'
                ];

                this.expectedColumns = [
                    {name: 'column_1', values: ['foo', 'bar'], type: 'text'},
                    {name: 'column_2', values: ['2', '2.1'], type: 'float'},
                    {name: 'column_3', values: ['3', 'sna'], type: 'text'},
                    {name: 'column_4', values: ['1/2/3', '456'], type: 'text'}
                ]

                this.options.hasHeader = false;
            });

            itParsesCorrectly();
        })

        describe("it retains values the user has overridden", function() {
            beforeEach(function() {
                this.contents =  [
                    'col1,col2,col3,col4',
                    'foo,2,3,1/2/3',
                    'bar,2.1,sna,456'
                ];
            })

            it("stores changes to the generated column names", function() {
                this.options.hasHeader = false;
                this.options.columnNameOverrides = ["ggg", "ttt", "rrr", "eee"];

                var csvParser = new chorus.utilities.CsvParser(this.contents, this.options);
                var columnData = csvParser.getColumnOrientedData();
                var columnNames = _.pluck(columnData, "name");

                expect(columnNames).toEqual(["ggg", "ttt", "rrr", "eee"]);
                expect(columnData[0].values.length).toBe(3);
            });

            it("stores changes to the header column names from the file", function() {
                this.options.hasHeader = true;
                this.options.columnNameOverrides = ["f", "d", "s", "a"];

                var csvParser = new chorus.utilities.CsvParser(this.contents, this.options);
                var columnData = csvParser.getColumnOrientedData();
                var columnNames = _.pluck(columnData, "name");

                expect(columnNames).toEqual(["f", "d", "s", "a"])
                expect(columnData[0].values.length).toBe(2);
            });
        });

        function itParsesCorrectly() {
            describe("getColumnOrientedData", function() {
                beforeEach(function() {
                    this.csvParser = new chorus.utilities.CsvParser(this.contents, this.options);

                    this.columns = this.csvParser.getColumnOrientedData();
                    this.types = _.pluck(this.columns, "type")
                    console.log(this.column);
                })

                it("has the correct number of columns", function() {
                    expect(this.columns.length).toBe(this.expectedColumns.length);
                })

                it("has the column name", function() {
                    expect(this.columns[0].name).toBe(this.expectedColumns[0].name);
                })

                it("has the correct number of data types", function() {
                    expect(this.types).toEqual(_.pluck(this.expectedColumns, "type"));
                });

                it("has the rows", function() {
                    _.each(this.columns, _.bind(function(column, i) {
                        expect(column.values).toEqual(this.expectedColumns[i].values)
                    }, this))
                })
            })
        }
    });

    describe("#normalizeForDatabase", function() {
        it("converts to lower case", function() {
            expect(chorus.utilities.CsvParser.normalizeForDatabase("FILENAME")).toBe("filename")
        });

        it("converts spaces to underscores", function() {
            expect(chorus.utilities.CsvParser.normalizeForDatabase("file name")).toBe("file_name")
        });

        it("converts periods to underscores", function() {
            expect(chorus.utilities.CsvParser.normalizeForDatabase("file.name")).toBe("file_name")
        });

        it("discards invalid characters", function() {
            expect(chorus.utilities.CsvParser.normalizeForDatabase("file^$name*&22_+33")).toBe("filename22_33")
        });

        it("trims the white spaces", function() {
            expect(chorus.utilities.CsvParser.normalizeForDatabase(" file^$name* &22_+33 ")).toBe("filename_22_33")
        });

        it("truncates at 64 characters", function() {
            expect(chorus.utilities.CsvParser.normalizeForDatabase("0123456789012345678901234567890123456789012345678901234567890123456789")).toBe("0123456789012345678901234567890123456789012345678901234567890123")
        });
    })
});
