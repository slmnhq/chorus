describe("chorus.views.SearchTabularDataList", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult();
        this.result.set({query: "foo"});
        this.models = this.result.tabularData();
        this.view = new chorus.views.SearchTabularDataList({collection: this.models, query: this.result});
        this.view.render();
    });

    context("with no results", function() {
        beforeEach(function() {
            this.view = new chorus.views.SearchTabularDataList({
                collection: new chorus.collections.Base()
            });

            this.view.render()
        });

        it("does not show the bar or the list", function() {
            expect(this.view.$(".details")).not.toExist();
            expect(this.view.$("ul")).not.toExist();
        });
    })

    it("should have a title", function() {
        expect(this.view.$(".title")).toContainTranslation("dataset.title_plural");
    });

    it("should show the number of results", function() {
        expect(this.view.$(".count")).toContainTranslation("search.count", {shown: this.models.length, total: this.models.attributes.total});
        expect(this.view.$(".show_all")).toExist();
    });

    context("clicking the show all link", function() {
        beforeEach(function() {
            spyOn(chorus.router, "navigate");
            this.view.$("a.show_all").click();
        });

        it("should navigate to the user results page", function() {
            expect(chorus.router.navigate).toHaveBeenCalledWith(this.result.showUrl(), true);
        });
    });

    describe("the 'found in workspaces' section", function() {
        beforeEach(function() {
            this.models.at(0).set({workspaces: [
                {
                    id: 10000,
                    name: "Foo"
                },
                {
                    id: 10010,
                    name: "Bar"
                },
                {
                    id: 10011,
                    name: "Baz"
                }
            ]});
            this.fakeQtip = stubQtip();
            this.view.render();
        });

        it("should display a link to the first workspace", function() {
            expect(this.view.$("li:eq(0) .location .found_in")).toContainTranslation("workspaces_used_in.body.other", {
                workspaceLink: "Foo",
                otherWorkspacesMenu: "2 other workspaces"
            });
        });
    });

    context("when the search results include a chorus view", function() {
        beforeEach(function() {
            this.models.reset([ fixtures.searchResultChorusView({ workspace: { name: "Chorus View Thing" } }) ]);
            this.view.render();
        });

        it("should display a link to the single workspace", function() {
            expect(this.view.$("li:eq(0) .location .found_in")).toContainTranslation("workspaces_used_in.body.one", {
                workspaceLink: "Chorus View Thing"
            });
        });
    });

    context("when there are three or fewer results", function() {
        beforeEach(function() {
            this.models = new chorus.collections.TabularDataSet([
                fixtures.tabularDataJson(),
                fixtures.tabularDataJson()
            ]);
            this.view = new chorus.views.SearchTabularDataList({collection: this.models});
            this.view.render();
        });

        it("should show the short count", function() {
            expect(this.view.$(".count")).toContainTranslation('search.count_short', {shown: 2});
            expect(this.view.$(".show_all")).not.toExist();
        });
    });

    it("renders an li for each model", function() {
        expect(this.view.$("li").length).toBe(10);
    });

    it("displays the items name", function() {
        expect(this.view.$("li:eq(0) .name")).toContainText(this.models.at(0).get("objectName"));
    });

    it("displays a link to the item", function() {
        expect(this.view.$("li:eq(0) .name")).toHaveAttr("href", this.models.at(0).showUrl());
    });

    it("displays an icon for the item", function() {
        var img = this.view.$("li:eq(0) .icon");
        expect(img).toExist();
        expect(img).toHaveAttr("src", this.models.at(0).iconUrl())
        expect(img).toHaveAttr("title", Handlebars.helpers.humanizedTabularDataType(this.models.at(0).attributes))
    });

    context("for a chorus view", function() {
        beforeEach(function() {
            expect(this.models.at(1).get("datasetType")).toBe('CHORUS_VIEW');
        });

        it("links to the correct dataset url", function() {
            expect(this.view.$('li:eq(1) .name').attr('href')).toMatch(/workspace/);
        })
    });

    context("when the results include comments", function() {
        beforeEach(function() {
            this.models.at(0).set({comments: [
                fixtures.commentJson({
                    content: "Comment content #1"
                }),
                fixtures.commentJson({
                    content: "Comment content #2"
                }),
                fixtures.commentJson({
                    content: "Comment content #3"
                }),
                fixtures.commentJson({
                    content: "Comment content #4"
                })
            ]});
            this.view.render();
            $("#jasmine_content").append(this.view.el);
        });

        it("renders the first three comments in the tabular data search results", function() {
            var visibleComments = this.view.$("li:eq(0) .comment:visible");
            expect(visibleComments.length).toBe(3);
            expect(visibleComments.eq(0).find(".comment_content")).toContainText("Comment content #1");
            expect(visibleComments.eq(1).find(".comment_content")).toContainText("Comment content #2");
            expect(visibleComments.eq(2).find(".comment_content")).toContainText("Comment content #3");
        });

        it("should have a link to display more comments", function() {
            expect(this.view.$('li:eq(0) a.show_more_comments')).toContainTranslation("search.comments_more", {count: 1});
        });

        context("when the display more comments link is clicked", function() {
            beforeEach(function() {
                this.view.$("li:eq(0) a.show_more_comments").click();
            });

            it("display the remainder of the comments", function() {
                var visibleComments = this.view.$("li:eq(0) .comment:visible");
                expect(visibleComments.length).toBe(4);
            });

            it("should have a link to display fewer comments, and hide the 'more comments' link", function() {
                expect(this.view.$('li:eq(0) a.show_fewer_comments')).toContainTranslation("search.comments_less");
                expect(this.view.$('li:eq(0) a.show_more_comments')).toBeHidden();
            });

            context("clicking the fewer comments link", function() {
                beforeEach(function() {
                    this.view.$("li:eq(0) a.show_fewer_comments").click();
                });

                it("should hide the remainder of the comments", function() {
                    var visibleComments = this.view.$("li:eq(0) .comment:visible");
                    expect(visibleComments.length).toBe(3);
                });

                it("should show the 'more comments' link", function() {
                    expect(this.view.$('li:eq(0) a.show_more_comments')).toBeVisible();
                });
            });
        });

        context("when there are fewer than three matching comments", function() {
            beforeEach(function() {
                this.models.at(0).set({comments: [
                    fixtures.commentJson({
                        content: "Another content #1"
                    }),
                    fixtures.commentJson({
                        content: "Another content #4"
                    })
                ]});
                this.view.render();
            });

            it("should not have a link to display more comments", function() {
                expect(this.view.$("li:eq(0) a.more_comments")).not.toExist();
            });
        });
    });
});
