describe("chorus.models.CSVImport", function() {
    beforeEach(function() {
        this.model = rspecFixtures.csvImport();
        this.model.set({
                csvId:this.model.id,
                id:null
            });
    });

    describe("#urlTemplate", function() {
        it("should have the correct url", function() {
            this.model.set({workspaceId: '7'});

            expect(this.model.url()).toMatchUrl("/workspaces/7/csv/" + this.model.get('csvId') + "/imports");
        });
    });

    describe("toJSON", function() {
        it("does not include the contents, as this was uploaded as the csv file", function() {
            expect(this.model.toJSON().csvimport.contents).toBeUndefined();
        });
    });
});