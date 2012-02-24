describe("chorus.models.SearchResult", function() {
    beforeEach(function() {
        this.model = new chorus.models.SearchResult({query: "the longest query in the world"})
    });

    it("returns a short name", function() {
        expect(this.model.displayShortName()).toBe("the longest query in...")
    });

    describe("#workfiles", function() {
        beforeEach(function() {
            this.model.set({
                workfile: {
                    numFound: 3,
                    docs: [
                        {
                            id: '1',
                            name: 'My <em>Cool</em> Workfile'
                        },
                        {
                            id: '2',
                            name: 'Workfiles are <em>Cool</em>'
                        },
                        {
                            id: '3',
                            name: '<em>Cool</em> Breeze'
                        }
                    ]
                }
            });

            this.workfiles = this.model.workfiles();
        });

        it("returns a WorkfileSet", function() {
            expect(this.workfiles).toBeA(chorus.collections.WorkfileSet)
        });

        it("has the right filenames, with em tags stripped out", function() {
            expect(this.workfiles.models.length).toBe(3);

            expect(this.workfiles.models[0].get('id')).toBe('1');
            expect(this.workfiles.models[0].get('name')).toBe('My <em>Cool</em> Workfile');
            expect(this.workfiles.models[0].get('fileName')).toBe('My Cool Workfile');

            expect(this.workfiles.models[1].get('id')).toBe('2');
            expect(this.workfiles.models[1].get('name')).toBe('Workfiles are <em>Cool</em>');
            expect(this.workfiles.models[1].get('fileName')).toBe('Workfiles are Cool');

            expect(this.workfiles.models[2].get('id')).toBe('3');
            expect(this.workfiles.models[2].get('name')).toBe('<em>Cool</em> Breeze');
            expect(this.workfiles.models[2].get('fileName')).toBe('Cool Breeze');
        });
    });
})
