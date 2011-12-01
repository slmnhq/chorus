describe("chorus.views.ActivityList", function() {
    beforeEach(function() {
        this.loadTemplate("activity_list");
        fixtures.model = 'ActivitySet';
    });

    describe("#render", function() {
        beforeEach(function() {
            this.collection = fixtures.modelFor('fetch');
            this.view = new chorus.views.ActivityList({collection: this.collection});
        });

        describe("before the collection has loaded", function() {
            beforeEach(function() {
                this.collection.loaded = undefined;
                this.view.render();
            })

            it("has a loading indicator", function() {
                expect(this.view.$(".loading")).toExist();
            });
        });

        describe("when the collection has loaded", function() {
            beforeEach(function() {
                this.view.render();
            });

            it("should not have a loading element", function() {
                expect(this.view.$(".loading")).not.toExist();
            });

            it("displays the list of activities", function() {
                expect(this.view.$("li[data-activity-id=10000]")).toExist();
                expect(this.view.$("li[data-activity-id=10001]")).toExist();
            });

            it("displays a title for each activity", function() {
                expect(this.view.$("li[data-activity-id=10000] .title")).toHaveText("NOT_IMPLEMENTED")
                expect(this.view.$("li[data-activity-id=10001] .title")).toHaveText("NOT_IMPLEMENTED")
            })

            it("displays author information for each activity", function() {
                expect(this.view.$("li[data-activity-id=10000] > .author img")).toHaveAttr("src", "/edc/userimage/edcadmin?size=icon")
                expect(this.view.$("li[data-activity-id=10000] > .author .name")).toHaveText("EDC Admin");
                expect(this.view.$("li[data-activity-id=10001] > .author img")).toHaveAttr("src", "/edc/userimage/dburkes?size=icon")
                expect(this.view.$("li[data-activity-id=10001] > .author .name")).toHaveText("Danny Burkes");
            })

            it("displays a timestamp for each activity", function() {
                expect(this.view.$("li[data-activity-id=10000] > .timestamp")).toHaveText("November 23");
                expect(this.view.$("li[data-activity-id=10001] > .timestamp")).toHaveText("April 23");
            })

            describe("comment rendering", function() {
                it("displays comments for each activity, if any", function() {
                    expect(this.view.$("li[data-activity-id=10000] .comments")).toExist();
                    expect(this.view.$("li[data-activity-id=10000] .comments li").length).toBe(2);
                    expect(this.view.$("li[data-activity-id=10001] .comments")).not.toExist();
                })

                it("displays author information for each comment", function() {
                    expect(this.view.$("li[data-comment-id=10023] > .author img")).toHaveAttr("src", "/edc/userimage/msofaer?size=icon")
                    expect(this.view.$("li[data-comment-id=10023] > .author .name")).toHaveText("Michael Sofaer");
                    expect(this.view.$("li[data-comment-id=10024] > .author img")).toHaveAttr("src", "/edc/userimage/mrushakoff?size=icon")
                    expect(this.view.$("li[data-comment-id=10024] > .author .name")).toHaveText("Mark Rushakoff");
                })

                it("displays a timestamp for each comment", function() {
                    expect(this.view.$("li[data-comment-id=10023] > .timestamp")).toHaveText("November 23");
                    expect(this.view.$("li[data-comment-id=10024] > .timestamp")).toHaveText("May 23");
                })

                it("displays the text of each comment", function() {
                    expect(this.view.$("li[data-comment-id=10023] > .text")).toHaveText("hi there");
                    expect(this.view.$("li[data-comment-id=10024] > .text")).toHaveText("hello");
                })

                context("when there are less than three comments", function() {
                    it("does not render a 'more comments' link", function() {
                        expect(this.view.$("li[data-activity-id=10000] .comments a.more")).not.toExist();
                    })
                })
                context("when there are three or more comments", function() {
                    beforeEach(function() {
                        var comments = this.collection.at(0).get("comments");
                        comments.push(comments[0]);
                        this.view.render();
                    })
                    
                    it("renders a 'more comments' link", function() {
                        expect(this.view.$("li[data-activity-id=10000] .comments a.more")).toExist();
                    })
                })
            })

        });
    })
});
