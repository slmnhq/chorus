describe("chorus.views.SearchInstance", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult();

        this.result.set({query: "foo"});
        this.model = this.result.instances().models[0];
        this.view = new chorus.views.SearchInstance({ model: this.model });
        this.view.render()
    });


    it("includes the correct instance icon", function() {
        expect(this.view.$("img.provider").attr("src")).toBe("/images/instances/hadoop_instance.png");
    });

    it("includes the correct state icon", function() {
        expect(this.view.$("img.state").attr("src")).toBe("/images/instances/green.png");
    });

    it("includes the state text as a title", function() {
        expect(this.view.$("img.state").attr("title")).toBe("Online");
    });

    it("has a link to the instance for each instance in the collection", function() {
        expect(this.view.$('.name').attr('href')).toBe(this.model.showUrl());
    });

    describe("comments", function() {
        beforeEach(function() {
            this.view.model.set({
                comments: [
                    {
                        "lastUpdatedStamp": "2012-03-07 17:19:14",
                        "isPublished": false,
                        "content": "what an awesome instance",
                        "isComment": false,
                        "id": "10120",
                        "isInsight": true,
                        "highlightedAttributes": {
                            "content": ["what an <em>awesome<\/em> instance"]
                        },
                        "owner": {
                            "id": "InitialUser",
                            "last_name": "Admin",
                            "first_name": "EDC"
                        }
                    }
                ]
            });
            this.view.render();
        });

        it("renders the comments", function() {
            expect(this.view.$(".search_result_comment_list .comment").length).toBe(1);
        });
    });
});
