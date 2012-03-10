describe("chorus.models.TypeAheadSearchResult", function() {
    beforeEach(function() {
        this.result = fixtures.typeAheadSearchResult();
    });

    describe("fixtures", function() {
        it('gives us what we expect', function() {
            expect(this.result.get('typeAhead').docs.length).toBe(7);
            expect(_.pluck(this.result.get('typeAhead').docs, 'entityType')).toEqual([
                'user',
                'workfile',
                'workspace',
                'hdfs',
                'databaseObject',
                'chorusView',
                'instance'
            ]);
        })
    });

    describe("results", function() {
        beforeEach(function() {
            this.searchResults = this.result.results();
        });

        it("returns objects of the appropriate type", function() {
            expect(this.searchResults[0]).toBeA(chorus.models.User);
            expect(this.searchResults[1]).toBeA(chorus.models.Workfile);
            expect(this.searchResults[2]).toBeA(chorus.models.Workspace);
            expect(this.searchResults[3]).toBeA(chorus.models.HdfsEntry);
            expect(this.searchResults[4]).toBeA(chorus.models.DatabaseObject);
            expect(this.searchResults[5]).toBeA(chorus.models.ChorusView);
            expect(this.searchResults[6]).toBeA(chorus.models.Instance);
        });

        it("expects all result objects to have a name and showUrl method", function() {
            _.each(this.searchResults, function(result) {
                expect(typeof result.name()).toBeA('string');
                expect(typeof result.showUrl()).toBe('string');
            })
        });
    })
});