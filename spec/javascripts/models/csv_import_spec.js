describe("chorus.models.CSVImport", function() {
    context("with comma separators", function() {

        beforeEach(function() {
            this.model = fixtures.csvImport({
                lines: [
                    "col1,col2,col3",
                    "row1val1,row1val2,row1val3",
                    "row2val1,row2val2,row2val3"
                ]
            });
            this.expectedColumns = [
                {name: 'col1', values: ['row1val1', 'row2val1']},
                {name: 'col2', values: ['row1val2', 'row2val2']},
                {name: 'col3', values: ['row1val3', 'row2val3']}
            ]
        })

        itParsesCorrectly();
    })
    context("with tab separators", function() {

        beforeEach(function() {
            this.model = fixtures.csvImport({
                lines: [
                    "col1\tcol2\tcol3",
                    "row1val1\trow1val2\trow1val3",
                    "row2val1\trow2val2\trow2val3"
                ]
            });
            this.expectedColumns = [
                {name: 'col1', values: ['row1val1', 'row2val1']},
                {name: 'col2', values: ['row1val2', 'row2val2']},
                {name: 'col3', values: ['row1val3', 'row2val3']}
            ]
            this.model.set({'delimiter': '\t'});
        })

        itParsesCorrectly();
    })
    function itParsesCorrectly() {
        describe("columnOrientedData", function() {
            beforeEach(function() {
                this.columns = this.model.columnOrientedData();
            })

            it("has the correct number of columns", function() {
                expect(this.columns.length).toBe(this.expectedColumns.length);
            })

            it("has the column name", function() {
                expect(this.columns[0].name).toBe(this.expectedColumns[0].name);
            })

            it("has the rows", function() {
                expect(this.columns[0].values).toEqual(this.expectedColumns[0].values);
            })

        })
    }
})