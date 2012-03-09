describe("chorus.views.NotificationList", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.NotificationSet([
            fixtures.notification({ unread: true }),
            fixtures.notification(),
            fixtures.notification()
        ]);
        this.collection.loaded = true;
        this.view = new chorus.views.NotificationList({ collection: this.collection });
    });

    describe("#render", function() {
        beforeEach(function() {
            spyOn(chorus.views.Activity.prototype, 'initialize').andCallThrough();
            this.view.render();
        });

        it("renders an li for each notification in the collection", function() {
            expect(this.view.$("li").length).toBe(3);
        });

        it("highlights the unread notifications", function() {
            expect(this.view.$("li:eq(0)")).toHaveClass("unread");
            expect(this.view.$("li:eq(1)")).not.toHaveClass("unread");
            expect(this.view.$("li:eq(2)")).not.toHaveClass("unread");
        });

        it("passes the 'isNotification' option to the activity views", function() {
            var viewOptions = chorus.views.Activity.prototype.initialize.mostRecentCall.args[0];
            expect(viewOptions.isNotification).toBeTruthy();
        });
    });

    describe("more link", function() {
        beforeEach(function() {
            this.collection.pagination = this.collection.pagination || {};
            this.collection.pagination.page = "1";
            this.collection.pagination.total = "99999999";
        });

        context("when options.allowMoreLink is false", function() {
            beforeEach(function() {
                this.view.options.allowMoreLink = false;
                this.view.render();
            });

            it("hides the more link", function() {
                expect(this.view.$(".more_notifications a")).not.toExist();
            });
        });

        context("when options.allowMoreLink is true", function() {
            beforeEach(function() {
                this.view.options.allowMoreLink = true;
                this.view.render();
            });

            context("when more results are available", function() {
                it("shows the more link", function() {
                    expect(this.view.$(".more_notifications a")).toExist();
                });

                context("clicking the more link", function() {
                    beforeEach(function() {
                        this.view.$(".more_notifications a").click();
                    });

                    it("loads more results", function() {
                        expect(this.server.lastFetch().params().page).toBe("2");
                    });

                    context("when the fetch completes", function() {
                        beforeEach(function() {
                            spyOn(chorus.collections.NotificationSet.prototype, "markAllRead").andCallThrough();
                            this.server.completeFetchFor(this.collection, this.collection, {page:2});
                        });

                        it("marks all notification read again", function() {
                            expect(chorus.collections.NotificationSet.prototype.markAllRead).toHaveBeenCalled();
                        });

                        xcontext("clicking the more link again", function() {
                            beforeEach(function() {
                                this.view.render();
                                chorus.collections.NotificationSet.prototype.markAllRead.reset();
                                expect(this.view.$(".more_notifications a")).toExist();
                                this.view.$(".more_notifications a").click();
                            });

                            it("lets you fetches again", function() {
                                expect(this.server.lastFetch().params().page).toBe("3");
                                this.server.completeFetchFor(this.collection, this.collection, {page:3});
                                expect(chorus.collections.NotificationSet.prototype.markAllRead).toHaveBeenCalled();
                            });
                        });
                    });



                });
            });

            context("when no more results are available", function() {
                beforeEach(function() {
                    this.collection.pagination.total = "1";
                    this.view.render();
                });

                it("doesn't show the more link", function() {
                    expect(this.view.$(".more_notifications a")).not.toExist();
                });

            });
        });
    });
});