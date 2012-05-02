    describe("chorus.collections.DatabaseSet", function() {
    beforeEach(function() {
        this.instance_id = '86'
        this.collection = new chorus.collections.DatabaseSet([], {instance_id: this.instance_id});
    });

    it("has the right show url", function() {
        expect(this.collection.showUrl()).toMatchUrl("#/instances/86/databases");
    });

    describe("reset", function() {
        it("sets the instance_id on all the new models", function() {
            var database = fixtures.database();
            this.collection.reset(database);
            expect(database.get("instance_id")).toBe(this.instance_id);
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
                response: [
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
            expect(params[1][0].response[0]).toBe(database);
        });

        it("should not modify the response when there is an error without databaseList", function() {
            var response = {
                other: 'stuff',
                response: []
            };
            this.collection.parse(response);
            expect(this.collection._super).toHaveBeenCalled();
            var params = this.collection._super.mostRecentCall.args;
            expect(params[0]).toBe('parse');
            expect(params[1][0]).toBe(response);
        });

    });
});

