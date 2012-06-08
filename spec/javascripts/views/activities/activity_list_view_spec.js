describe("chorus.views.ActivityList", function() {
    beforeEach(function() {
        this.collection = chorus.collections.ActivitySet.forDashboard();
        this.collection.reset([
            fixtures.activities.NOTE_ON_CHORUS_VIEW(),
            fixtures.activities.NOTE_ON_CHORUS_VIEW()
        ]);
        this.collection.loaded = true;
        this.view = new chorus.views.ActivityList({collection: this.collection, additionalClass: "foo_class", type: "Foo"});
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("adds additionalClass to the top-level element", function() {
            expect($(this.view.el)).toHaveClass("foo_class");
        })

        it("renders an li for each item in the collection", function() {
            expect(this.view.$("li[data-activity-id]").length).toBe(this.collection.length);
        });


        describe("when there are no activity items", function() {
            context("and there is an type", function() {
                beforeEach(function() {
                    this.collection.reset([]);
                    this.view.render();
                });

                it("displays the 'no notes' message", function() {
                    expect(this.view.$("ul.activities li")).not.toExist();

                    expect(this.view.$(".no_activity")).toContainTranslation("activity.none", {type: "Foo"});
                })
            });

            context("and there is no type", function() {
                beforeEach(function() {
                    delete this.view.options.type;
                    this.collection.reset([]);
                    this.view.render();
                });

                it("displays the 'no notes' message", function() {
                    expect(this.view.$("ul.activities li")).not.toExist();
                    expect(this.view.$(".no_activity")).toContainTranslation("activity.no_recent");
                })
            });
        })

        describe("the isNotification option", function() {
            it("passes the option through to the activity views", function() {
                spyOn(chorus.views.Activity.prototype, "initialize").andCallThrough();
                this.view.options.isNotification = true;
                this.view.render();

                var viewOptions = chorus.views.Activity.prototype.initialize.mostRecentCall.args[0];
                expect(viewOptions.isNotification).toBeTruthy();
            });
        });

        describe("comment rendering", function() {
            beforeEach(function() {
                spyOn(chorus, "cachebuster").andReturn(555);
                var comments = this.collection.at(0).comments();
                comments.add([
                    new chorus.models.Comment({
                        author: {
                            id: 10101,
                            fullName: "John Commenter"
                        },
                        text: 'I love you all'
                    }),
                    new chorus.models.Comment({
                        author: {
                            id: 10102
                        },
                        text: 'I love you all'
                    }),
                    new chorus.models.Comment({
                        author: {
                            id: 10103
                        },
                        text: 'I love you all'
                    })
                ]);

                this.view.render();
            });

            describe("when the more link is clicked", function() {
                beforeEach(function() {
                    spyOnEvent(this.view, "content:changed");
                    this.view.$("li[data-activity-id]:eq(0) .comments a.more").click();
                });

                it("adds the 'more' class to the comments section", function() {
                    expect(this.view.$("li[data-activity-id]:eq(0) .comments")).toHaveClass("more");
                })

                it("triggers a content:changed event", function() {
                    expect("content:changed").toHaveBeenTriggeredOn(this.view);
                })

                describe("when the less link is clicked", function() {
                    beforeEach(function() {
                        resetBackboneEventSpies(this.view);
                        this.view.$("li[data-activity-id]:eq(0) .comments a.less").click();
                    });

                    it("removes the 'more' class to the comments section", function() {
                        expect(this.view.$("li[data-activity-id]:eq(0) .comments")).not.toHaveClass("more");
                    })

                    it("triggers a content:changed event", function() {
                        expect("content:changed").toHaveBeenTriggeredOn(this.view);
                    });
                });
            });
        });

        describe("pagination", function() {
            context("with full pagination information in the response", function() {
                beforeEach(function() {
                    this.collection.pagination = {};
                    this.collection.pagination.total = "1";
                    this.collection.pagination.page = "1";
                    this.collection.pagination.records = "8";
                    this.view.render();
                });

                context("when there is no next page", function() {
                    itDoesNotShowAMoreLink();
                })

                context("when there is a next page", function() {
                    beforeEach(function() {
                        this.collection.pagination.total = "4";
                        this.view.render();
                    })

                    itShowsAMoreLink(2);
                });
            });

            context("with partial pagination information in the response", function() {
                beforeEach(function() {
                    this.collection.reset([
                        fixtures.activities.NOTE_ON_CHORUS_VIEW(),
                        fixtures.activities.NOTE_ON_CHORUS_VIEW(),
                        fixtures.activities.NOTE_ON_CHORUS_VIEW(),
                        fixtures.activities.NOTE_ON_CHORUS_VIEW()
                    ])

                    this.collection.pagination = {};
                    this.collection.pagination.total = "-1";
                    this.collection.pagination.records = "-1";
                });

                context("when there are no more activities", function() {
                    beforeEach(function() {
                        this.collection.pagination.page = "2";
                        this.collection.attributes.pageSize = 3;
                        this.view.render();
                    });

                    itDoesNotShowAMoreLink();
                })

                context("when there might be more activities", function() {
                    beforeEach(function() {
                        this.collection.pagination.page = "2";
                        this.collection.attributes.pageSize = 2;
                        this.view.render();
                    });

                    itShowsAMoreLink(3);
                })
            })

            function itDoesNotShowAMoreLink() {
                it("does not render a 'more' link", function() {
                    expect(this.view.$("a.more_activities")).not.toExist();
                })
            }

            function itShowsAMoreLink(nextPage) {
                it("renders a 'more' link", function() {
                    expect(this.view.$(".more_activities a")).toExist();
                })

                describe("when the 'more' link is clicked", function() {
                    beforeEach(function() {
                        this.originalActivityCount = this.view.$('li[data-activity-id]').length;
                        spyOn(this.view, 'postRender').andCallThrough();
                        this.view.$(".more_activities a").click();

                        this.server.completeFetchFor(this.collection, [
                            fixtures.activity(),
                            fixtures.activity(),
                            fixtures.activity()
                        ], { page: nextPage });
                    });

                    it("fetches the next page of the activity stream", function() {
                        expect(this.view.$('li[data-activity-id]').length).toBe(this.originalActivityCount + 3);
                    })

                    it("only re-renders the page once", function() {
                        expect(this.view.postRender.callCount).toBe(1);
                    });
                });
            }
        })

    });

    describe("error handling", function() {
        beforeEach(function() {
            spyOn(chorus, "log");
            spyOn(this.collection.at(0), 'get').andCallFake(function() {throw 'an error during rendering'})
        })

        it("does not raise an exception", function() {
            this.view.render();
        });

        it("logs the exception", function() {
            this.view.render();
            expect(chorus.log).toHaveBeenCalled();
        })
    });

    describe("#show", function() {
        beforeEach(function() {
            this.view.render();
            expect(this.view.activities.length).toBe(this.collection.length);
            _.each(this.view.activities, function(activity) {
                spyOn(activity, "show");
            });
            this.view.show();
        });

        it("calls show on each activity", function() {
            _.each(this.view.activities, function(activity) {
                expect(activity.show).toHaveBeenCalled();
            });
        });
    });
});
