describe("chorus.collections.DatabaseSet", function() {
    beforeEach(function() {
        this.instanceId = '86'
        this.collection = new chorus.collections.DatabaseSet([], {instanceId: this.instanceId});
    });

    it("has the right show url", function() {
        expect(this.collection.showUrl()).toMatchUrl("#/instances/86/databases");
    });

    describe("reset", function() {
        it("sets the instanceId on all the new models", function() {
            var database = fixtures.database();
            this.collection.reset(database);
            expect(database.get("instanceId")).toBe(this.instanceId);
        });
    });

    describe("parse", function() {
        beforeEach(function() {
            spyOn(this.collection, '_super');
        });

        it("should call super after pulling the nested databaseList into 'resource'", function() {
            var database = fixtures.databaseJson();
            var response = {
                other: 'stuff',
                resource: [
                    {
                        databaseList: [
                            database
                        ],
                        role: {

                        }
                    }
                ]
            };
            this.collection.parse(response);
            expect(this.collection._super).toHaveBeenCalled();
            var params = this.collection._super.mostRecentCall.args;
            expect(params[0]).toBe('parse');
            expect(params[1][0].resource[0]).toBe(database);
        });

        it("should not modify the response when there is an error without databaseList", function() {
            var response = {
                other: 'stuff',
                resource: []
            };
            this.collection.parse(response);
            expect(this.collection._super).toHaveBeenCalled();
            var params = this.collection._super.mostRecentCall.args;
            expect(params[0]).toBe('parse');
            expect(params[1][0]).toBe(response);
        });

    });
});

