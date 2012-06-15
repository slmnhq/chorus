describe("chorus.models.BulkSaver", function() {
    describe("#save", function() {
        var collection, saver;

        beforeEach(function() {
            collection = new chorus.collections.Base();
            collection.urlParams = function() {
                return {abc: "123"};
            };
            collection.urlTemplate = "the/collections/url";

            saver = new chorus.models.BulkSaver({collection: collection});
        });

        it("submits to its collection's url", function() {
            saver.save();
            expect(this.server.lastCreate().url).toHaveUrlPath("/the/collections/url");
        });

        it("adds its collection's model's ids to the url params", function() {
            saver.save();
            expect(this.server.lastCreate().url).toContainQueryParams({abc: "123"});
        });

        it("triggers saved on the collection", function() {
            spyOnEvent(collection, "saved");
            saver.save();
            this.server.lastCreate().succeed();
            expect("saved").toHaveBeenTriggeredOn(collection);
        });

        it("triggers saveFailed on the collection", function() {
            spyOnEvent(collection, "saveFailed");
            saver.save();
            this.server.lastCreate().failUnprocessableEntity();
            expect("saveFailed").toHaveBeenTriggeredOn(collection);
        });

    });
});