describe("chorus.models.Dataset", function() {
    var objectWithEncodingIssues = {
        schema : {
            name: "b/a/r",
            id: 3,
            database: {
                name: "%foo%",
                id: 2,
                instance: {
                    id: 1
                }
            }
        },
        objectName: "a space"
    };

    beforeEach(function() {
        this.dataset = rspecFixtures.dataset({
            schema: {
                id: 1,
                name: "ipa",
                database: {
                    "name": "beers",
                    instance: {
                        id: 12
                    }
                }
            },
            objectType: "TABLE"
        });
    });

    describe("url", function() {
        context("when it is a table", function() {
            beforeEach(function() {
                this.dataset = rspecFixtures.dataset(objectWithEncodingIssues);
            });

            it("uses the table exploration api", function() {
                expect(this.dataset.url()).toContain("/datasets/" + + this.dataset.id)
            });
        });

        context("when it is a view", function() {
            beforeEach(function() {
                var viewWithEncodingIssues = objectWithEncodingIssues;
                viewWithEncodingIssues.objectType = "VIEW";
                this.dataset = rspecFixtures.dataset(viewWithEncodingIssues);
            });

            it("uses the table exploration api", function() {
                expect(this.dataset.url()).toContain("/datasets/" + this.dataset.id)
            });
        });
    });

    describe("showUrl", function() {
        context("when it is a table", function() {
            beforeEach(function() {
                this.dataset = rspecFixtures.dataset(objectWithEncodingIssues);
            });

            it("has the correct url", function() {
                expect(this.dataset.showUrl()).toContain("/datasets/" + this.dataset.id)
            });

            it("works when there is markup in the name (e.g. result from type ahead search", function() {
                this.dataset.set({objectName: "<em>a</em> space"})
                expect(this.dataset.showUrl()).toContain("/datasets/" + this.dataset.id);
            })
        });

        context("when it is a view", function() {
            beforeEach(function() {
                this.dataset = rspecFixtures.dataset({objectType: "VIEW"});
            });

            it("uses the view exploration api", function() {
                var pieces = [
                    "#/datasets",
                    this.dataset.id
                ]
                var url = encodeURI(pieces.join('/'));
                expect(this.dataset.showUrl()).toMatchUrl(url);
            });
        });

        context("when it contains html", function() {
            it("removes the html", function() {
                this.dataset.set({ objectName: "<em>mmmm</em> good" });
                expect(this.dataset.showUrl()).toMatchUrl("#/datasets/" + this.dataset.id);
            })
        })
    })

    describe("when the 'invalidated' event is triggered", function() {
        describe("when the dataset belongs to a collection", function() {
            beforeEach(function() {
                this.collection = new chorus.collections.DatasetSet();
                this.collection.add(this.dataset);
            });

            it("re-fetches itself, because the last comment might have changed", function() {
                this.dataset.trigger("invalidated");
                expect(this.dataset).toHaveBeenFetched();
            });
        });

        describe("when the dataset has no collection", function() {
            it("does not fetch anything", function() {
                this.dataset.trigger("invalidated");
                expect(this.dataset).not.toHaveBeenFetched();
            });
        });
    });


    describe("#isChorusView", function() {
        it("is always false", function() {
            expect(this.dataset.isChorusView()).toBeFalsy();
        });
    });
});
