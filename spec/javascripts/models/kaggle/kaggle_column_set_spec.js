describe("KaggleColumnSet", function() {
   beforeEach(function() {
        this.collection = new chorus.collections.KaggleColumnSet();
   });

   describe("#initialize", function() {
        it("should populate the collection with the correct columns", function() {
            var models = this.collection.models;
            expect(models[0].get("name")).toBe("rank");
            expect(models[1].get('name')).toBe("competitions");
            expect(models[2].get('name')).toBe("competition_types");
            expect(models[3].get('name')).toBe("fav_techniques");
            expect(models[4].get('name')).toBe("fav_software");
            expect(models[5].get('name')).toBe("location");
        });
   });
});