describe("chorus.views.NotificationList", function() {
    beforeEach(function() {
        this.collection = rspecFixtures.notificationSet();
        var brokenNotification = new chorus.models.Notification();
        brokenNotification.set({ action: "IMPORT_SUCCESS" });
        this.collection.add(brokenNotification);
        this.view = new chorus.views.NotificationList({ collection: this.collection });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.collection.loaded = true;
            spyOn(chorus, 'log');
            spyOn(chorus.views.Activity.prototype, 'initialize').andCallThrough();
            this.view.render();
        });

        it("renders an li for each notification in the collection", function() {
            expect(this.view.$("li.activity").length).toBe(4);
        });

        it("does not render the links section in the handlebars template", function() {
            expect(this.view.$('li').find('.comment').length).toEqual(0);
            expect(this.view.$('li').find('.publish').length).toEqual(0);
        });

        it("highlights the unread notifications", function() {
            expect(this.view.$("li:eq(0)")).toHaveClass("unread");
            expect(this.view.$("li:eq(1)")).toHaveClass("unread");
            expect(this.view.$("li:eq(2)")).toHaveClass("unread");
            expect(this.view.$("li:eq(3)")).not.toHaveClass("unread");
        });

        it("passes the 'isNotification' option to the activity views", function() {
            var viewOptions = chorus.views.Activity.prototype.initialize.mostRecentCall.args[0];
            expect(viewOptions.isNotification).toBeTruthy();
        });

        it("passes the 'isReadOnly' option to the activity views", function() {
            var viewOptions = chorus.views.Activity.prototype.initialize.mostRecentCall.args[0];
            expect(viewOptions.isReadOnly).toBeTruthy();
        });

        it("skips broken notifications", function() {
            expect(chorus.log).toHaveBeenCalled();
            expect(chorus.log.mostRecentCall.args[3]).toBe(this.collection.at(4));
        });
    });

    describe("error handling bad notifications", function() {
        beforeEach(function() {
            this.collection.loaded = true;
            spyOn(chorus.views.Activity.prototype, 'initialize').andCallThrough();
        });

        it("should show toast message for broken notifications in dev mode", function() {
            spyOn(chorus, "toast");
            chorus.isDevMode.andReturn(true);
            this.view.render();
            expect(chorus.toast).toHaveBeenCalled();
        });

        it ("should not show toast message for broken activities in non dev mode", function() {
            spyOn(chorus, "toast");
            chorus.isDevMode.andReturn(false);
            this.view.render();
            expect(chorus.toast).not.toHaveBeenCalled();
        })
    });

    describe("more link", function() {
        beforeEach(function() {
            this.collection.loaded = true;
            this.collection.pagination = (this.collection.pagination || {});
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
                            var newNotifications = this.collection.models;

                            spyOn(chorus.collections.NotificationSet.prototype, "markAllRead").andCallThrough();
                            this.server.completeFetchFor(this.collection, newNotifications,
                                {page:2}, {page: "2", total: "9999999"});
                        });

                        it("renders the new notifications", function() {
                            expect(this.view.$("li.activity").length).toBe(8);
                        });

                        it("marks all notification read again", function() {
                            expect(chorus.collections.NotificationSet.prototype.markAllRead).toHaveBeenCalled();
                        });

                        context("clicking the more link again", function() {
                            beforeEach(function() {
                                expect(this.view.$(".more_notifications a")).toExist();
                                this.view.$(".more_notifications a").click();
                            });

                            it("marks everything read again", function() {
                                expect(this.server.lastFetch().params().page).toBe("3");
                                this.server.completeFetchFor(this.collection, this.collection, {page:3}, {page: "3", total: "9999999"});
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

    describe("#show", function() {
        beforeEach(function() {
            this.view.render();
            expect(this.view.activities.length).toBe(4);
            _.each(this.view.activities, function(activity) {
                spyOn(activity, "show");
            });
            this.view.show();
        });

        //TODO: this test is broken
        xit("calls show on each activity", function() {
            _.each(this.view.activities, function(activity) {
                expect(activity.show).toHaveBeenCalled();
            });
        });
    });
});
