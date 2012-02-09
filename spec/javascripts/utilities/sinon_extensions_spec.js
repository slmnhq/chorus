describe("sinon extensions", function() {
    describe("#lastFetchFor", function() {
        context("when #fetchAll was called on a collection (setting a non-default 'rows' parameter)", function() {
            beforeEach(function() {
                this.collection = new chorus.collections.UserSet();
                this.collection.fetchAll();
            });

            it("returns the request made by #fetchAll", function() {
                expect(this.server.lastFetchFor(this.collection)).toBeDefined();
            });
        });
    });

    describe("#completeFetchFor", function() {
        beforeEach(function() {
            this.model = new chorus.models.User({ id: '1' })
            this.collection = new chorus.collections.UserSet()

            this.model.fetch()
            this.collection.fetch()
        })


        context("it is called with a specified result", function(){
            beforeEach(function() {
                this.server.completeFetchFor(this.model, { name: "John Smith", secretIdentity: "Neo" })
            })

            it("succeeds with the specified result", function() {
                expect(this.model.get('name')).toBe("John Smith")
                expect(this.model.loaded).toBeTruthy()
            })
        })

        context("when no result is passed", function() {
            context("it is called with a backbone model", function() {
                beforeEach(function() {
                    var user = new chorus.models.User({ id: '1', name: "Keanu Reeves" });
                    this.server.completeFetchFor(user);
                });

                it("uses the current attributes of the model", function() {
                    expect(this.model.get('name')).toBe("Keanu Reeves")
                    expect(this.model.loaded).toBeTruthy()
                })
            })

            context("it is called with a collection", function() {
                beforeEach(function() {
                    var otherCollection = new chorus.collections.UserSet([], { group: "Agents" })
                    this.server.completeFetchFor(otherCollection);
                });

                it("uses an empty model set", function() {
                    expect(this.collection.models.length).toBe(0)
                    expect(this.collection.get('group')).toBeUndefined()
                    expect(this.collection.loaded).toBeTruthy()
                })
            })
        });
    })
});
