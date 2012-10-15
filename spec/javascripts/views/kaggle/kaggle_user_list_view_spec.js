describe("chorus.views.KaggleUserList", function() {
    beforeEach(function() {
        this.collection = rspecFixtures.kaggleUserSet();
        this.collection.loaded = true;
    });

    it("is a selectable list", function() {
        expect(new chorus.views.KaggleUserList({collection: this.collection})).toBeA(chorus.views.SelectableList);
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view = new chorus.views.KaggleUserList({collection: this.collection});
            spyOn(chorus.PageEvents, 'broadcast').andCallThrough();
            this.view.options.checkable = true;
            this.view.render();
            this.checkboxes = this.view.$("> li input[type=checkbox]");
        });

        describe("when a kaggle user is checked", function() {
            beforeEach(function() {
                this.checkboxes.eq(1).click().change();
            });

            it("does not 'select' the kaggle_user", function() {
                expect(this.view.$("li").eq(1)).not.toBe(".selected");
            });

            it("broadcasts the 'kaggleUser:checked' event with the collection of currently-checked kaggle users", function() {
                expectKaggleUserChecked([ this.collection.at(1) ]);
            });

            describe("checking another kaggle user", function() {
                beforeEach(function() {
                    this.checkboxes.eq(0).click().change();
                });

                it("broadcasts the 'kaggle_user:checked' event with the collection of currently-checked kaggle users", function() {
                    expectKaggleUserChecked([ this.collection.at(1), this.collection.at(0) ]);
                });

                describe("when one of the items is clicked again", function() {
                    beforeEach(function() {
                        this.checkboxes.eq(0).click().change();
                    });

                    it("broadcasts the 'kaggleUser:checked' event with an empty collection", function() {
                        expectKaggleUserChecked([ this.collection.at(1) ]);
                    });
                });
            });

            describe("when returning to the same page after switching pages", function() {
                beforeEach(function() {
                    this.view.collection.fetch();
                    this.server.completeFetchFor(this.view.collection, this.view.collection.models);
                });

                it("keeps the same items checked", function() {
                    expect(this.view.$("input[type=checkbox]").filter(":checked").length).toBe(1);
                    expect(this.view.$("input[type=checkbox]").eq(1)).toBe(":checked");
                });
            });
        });

        describe("select all and select none", function() {
            context("when the selectAll page event is recieved", function() {
                beforeEach(function() {
                    spyOn(this.collection, 'fetchAll').andCallThrough();
                    chorus.PageEvents.broadcast("selectAll");
                });

                it("fetches all of the kaggle users", function() {
                    var fetch = this.server.lastFetchFor(this.collection);
                    expect(fetch.url).toContainQueryParams({ per_page: 1000 });
                });

                describe("when the fetch completes", function() {
                    beforeEach(function() {
                        this.server.completeFetchAllFor(this.collection, this.collection.models);
                    });

                    it("checks all of the kaggle users", function() {
                        expect(this.view.$("input[type=checkbox]:checked").length).toBe(2);
                    });

                    it("broadcasts the 'kaggleUser:checked' page event with a collection of all kaggle users", function() {
                        expectKaggleUserChecked(this.collection.models);
                    });
                });

                context("when the selectNone page event is received", function() {
                    beforeEach(function() {
                        chorus.PageEvents.broadcast("selectNone");
                    });

                    it("un-checks all of the kaggle users", function() {
                        expect(this.view.$("input[type=checkbox]:checked").length).toBe(0);
                    });

                    it("broadcasts the 'kaggleUser:checked' page event with an empty collection", function() {
                        expectKaggleUserChecked([]);
                    });
                });
            });
        });

        function expectKaggleUserChecked(expectedModels) {
            expect(chorus.PageEvents.broadcast).toHaveBeenCalled();
            var eventName = chorus.PageEvents.broadcast.mostRecentCall.args[0];
            expect(eventName).toBe("kaggleUser:checked");

            var collection = chorus.PageEvents.broadcast.mostRecentCall.args[1];
            expect(collection).toBeA(chorus.collections.KaggleUserSet);
            expect(collection.pluck("id")).toEqual(_.pluck(expectedModels, "id"));
        }

        it("displays the list of users", function() {
            expect(this.view.$("> li").length).toBe(this.collection.length);
        });

        it("displays the usernames", function() {
            expect(this.view.$(".name:contains("+ this.collection.at(0).get("username") +")")).toExist();
        });

        it("displays the location", function() {
            expect(this.view.$(".location:contains("+ this.collection.at(0).get("location") +")")).toExist();
        });

        it("displays the rank", function() {
            expect(this.view.$(".kaggle_rank:contains("+ this.collection.at(0).get("rank") +")")).toExist();
        });

        it("displays a checkbox for each kaggle user", function() {
            expect(this.checkboxes.length).toBe(this.collection.length);
        });

        it("displays the gravatar url when the user has one", function() {
            expect(this.view.$("img.profile:eq(0)")).toHaveAttr("src", this.collection.at(0).gravatarUrl);
        });

        it("displays the default gravatar image when the user does not have one", function() {
            this.collection.at(0).set({gravatarUrl: ''});
            this.view.render();
            expect(this.view.$("img.profile:eq(0)")).toHaveAttr("src", "/images/kaggle/default_user.jpeg");
        });

        it("broadcasts kaggle_user:selected when a user's entry is selected", function() {
            var user = this.collection.at(0);
            this.view.itemSelected(user);
            expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("kaggleUser:selected", user);
        });
    });
});
