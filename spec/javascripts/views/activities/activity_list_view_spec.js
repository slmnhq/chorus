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

            it("displays an image link to the author for each activity", function() {
                expect(this.view.$("li[data-activity-id=10000] > .image a")).toHaveAttr("href", "#/users/edcadmin")
                expect(this.view.$("li[data-activity-id=10000] > .image a img")).toHaveAttr("src", "/edc/userimage/edcadmin?size=icon")
                expect(this.view.$("li[data-activity-id=10001] > .image a")).toHaveAttr("href", "#/users/dburkes")
                expect(this.view.$("li[data-activity-id=10001] > .image a img")).toHaveAttr("src", "/edc/userimage/dburkes?size=icon")
            })

            it("displays a title for each activity", function() {
                expect(this.view.$("li[data-activity-id=10000] .title")).toHaveText("NOT_IMPLEMENTED")
                expect(this.view.$("li[data-activity-id=10001] .title")).toHaveText("NOT_IMPLEMENTED")
            })

            it("displays information for each activity", function() {
                expect(this.view.$("li[data-activity-id=10000] > .info a")).toHaveAttr("href", "#/users/edcadmin")
                expect(this.view.$("li[data-activity-id=10000] > .info a .name")).toHaveText("EDC Admin");
                expect(this.view.$("li[data-activity-id=10000] > .info .timestamp")).toHaveText("November 23");

                expect(this.view.$("li[data-activity-id=10001] > .info a")).toHaveAttr("href", "#/users/dburkes")
                expect(this.view.$("li[data-activity-id=10001] > .info a .name")).toHaveText("Danny Burkes");
                expect(this.view.$("li[data-activity-id=10001] > .info .timestamp")).toHaveText("April 23");
            })

            it("displays a Comment link for each activity", function() {
                expect(this.view.$("li[data-activity-id=10000] > .links a.comment")).toExist();
            })

            describe("comment rendering", function() {
                it("displays comments for each activity, if any", function() {
                    expect(this.view.$("li[data-activity-id=10000] .comments")).toExist();
                    expect(this.view.$("li[data-activity-id=10000] .comments li").length).toBe(2);
                    expect(this.view.$("li[data-activity-id=10001] .comments")).not.toExist();
                })

                it("displays information for each comment", function() {
                    expect(this.view.$("li[data-comment-id=10023] > .image a")).toHaveAttr("href", "#/users/msofaer")
                    expect(this.view.$("li[data-comment-id=10023] > .image a img")).toHaveAttr("src", "/edc/userimage/msofaer?size=icon")
                    expect(this.view.$("li[data-comment-id=10023] > .info a .name")).toHaveText("Michael Sofaer");
                    expect(this.view.$("li[data-comment-id=10023] > .info .timestamp")).toHaveText("November 23");
                    expect(this.view.$("li[data-comment-id=10024] > .image a")).toHaveAttr("href", "#/users/mrushakoff")
                    expect(this.view.$("li[data-comment-id=10024] > .image a img")).toHaveAttr("src", "/edc/userimage/mrushakoff?size=icon")
                    expect(this.view.$("li[data-comment-id=10024] > .info a .name")).toHaveText("Mark Rushakoff");
                    expect(this.view.$("li[data-comment-id=10024] > .info .timestamp")).toHaveText("May 23");
                })

                it("displays the text of each comment", function() {
                    expect(this.view.$("li[data-comment-id=10023] > .text")).toHaveText("hi there");
                    expect(this.view.$("li[data-comment-id=10024] > .text")).toHaveText("hello");
                })

                it("does not initially add the 'more' class to any comment list", function() {
                    expect(this.view.$("ul.comments")).not.toHaveClass("more");
                })

                context("when there are less than three comments", function() {
                    it("does not render a 'more comments' link", function() {
                        expect(this.view.$("li[data-activity-id=10000] .comments a.more")).not.toExist();
                    })

                    it("does not apply the 'more' class to any comments", function() {
                        expect(this.view.$(".comments li.more")).not.toExist();
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

                    it("applies the 'more' class to trailing elements", function() {
                        expect(this.view.$(".comments li:eq(0)")).not.toHaveClass("more");
                        expect(this.view.$(".comments li:eq(1)")).not.toHaveClass("more");
                        expect(this.view.$(".comments li:eq(2)")).toHaveClass("more");
                    })
                })
            })

            describe("pagination", function() {
                context("when there is no next page", function() {
                    it("does not render a 'more' link", function() {
                        expect(this.view.$("a.more_activities")).not.toExist();
                    })
                })

                context("when there is a next page", function() {
                    beforeEach(function() {
                        this.collection.pagination.total = "4";
                        this.view.render();
                    })
                    
                    it("renders a 'more' link", function() {
                        expect(this.view.$("a.more_activities")).toExist();
                    })

                    describe("when the 'more' link is clicked", function() {
                        it("fetches the next page of the activity stream", function() {
                            spyOn(this.collection, 'fetchPage');
                            this.view.$("a.more_activities").click();
                            expect(this.collection.fetchPage).toHaveBeenCalledWith(2, { add : true });
                        })
                    })
                })
            })
        });
    });

    describe("comments", function() {
        beforeEach(function() {
            this.collection = fixtures.modelFor('fetch');
            var comments = this.collection.at(0).get("comments");
            comments.push(comments[0]);
            this.view = new chorus.views.ActivityList({collection: this.collection});
            this.view.render();
        })

        describe("expanding", function() {
            beforeEach(function() {
                this.view.$(".morelinks:eq(0) a.more").click();
            })

            it("adds the 'more' class to the surrounding comment list", function() {
                expect(this.view.$("ul.comments:eq(0)")).toHaveClass("more");
            })

            describe("then contracting", function() {
                beforeEach(function() {
                    this.view.$(".morelinks:eq(0) a.less").click();
                })

                it("removes the 'more' class from the surrounding comment list", function() {
                    expect(this.view.$("ul.comments:eq(0)")).not.toHaveClass("more");
                })
            })
        })
    })
});
