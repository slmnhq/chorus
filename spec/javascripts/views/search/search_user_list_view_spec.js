describe("chorus.views.SearchUserList", function() {
    beforeEach(function() {
        this.view = new chorus.views.SearchUserList({
            collection: fixtures.userSet(fixtures.searchResultJson().user.docs)
        });

        this.collection = this.view.collection;

        this.view.render();
    });

    describe("details bar", function() {
        it("has a title", function() {
            expect(this.view.$(".details .title")).toContainTranslation("search.users.title");
        });

        context("has no additional results", function() {
            beforeEach(function() {
                this.view = new chorus.views.SearchUserList({
                    collection: fixtures.userSet(fixtures.searchResultJson().user.docs.slice(0, 3)),
                    total: 3
                });

                this.view.render()
            });

            it("has a short count", function() {
                expect(this.view.$(".details .count")).toContainTranslation("search.count_short", {shown: "3"});
            });

            it("has no showAll link", function() {
                expect(this.view.$(".details a.show_all")).not.toExist();
            })
        })

        context("has additional results", function() {
            beforeEach(function() {
                this.view = new chorus.views.SearchUserList({
                    collection: fixtures.userSet(fixtures.searchResultJson().user.docs.slice(0, 3)),
                    total: 4
                });

                this.view.render()
            });

            it("has a long count", function() {
                expect(this.view.$(".details .count")).toContainTranslation("search.count", {shown: "3", total: "4"});
            });

            it("has a showAll link", function() {
                expect(this.view.$(".details a.show_all")).toContainTranslation("search.show_all")
            })
        })

        context("has no results at all", function() {
            beforeEach(function() {
                this.view = new chorus.views.SearchUserList({
                    collection: fixtures.userSet([]),
                    total: "0"
                });

                this.view.render()
            });

            it("does not show the bar or the list", function() {
                expect(this.view.$(".details")).not.toExist();
                expect(this.view.$("ul")).not.toExist();
            });
        })
    });

    describe("list elements", function() {
        it("there is one for each model in the collection, up to 3", function() {
            expect(this.view.$('li').length).toBe(4);
        });

        it("has the right data-id attribute", function() {
            expect(""+this.view.$("li").eq(0).data("id")).toBe(this.collection.at(0).get("id"));
            expect(""+this.view.$("li").eq(1).data("id")).toBe(this.collection.at(1).get("id"));
            expect(""+this.view.$("li").eq(2).data("id")).toBe(this.collection.at(2).get("id"));
            expect(""+this.view.$("li").eq(3).data("id")).toBe(this.collection.at(3).get("id"));
        });

        it("includes the correct user icon", function() {
            expect(this.view.$("li img.icon").eq(0).attr("src")).toBe("/edc/userimage/"+ this.collection.at(0).get("id") + "?size=icon");
            expect(this.view.$("li img.icon").eq(1).attr("src")).toBe("/edc/userimage/"+ this.collection.at(1).get("id") + "?size=icon");
            expect(this.view.$("li img.icon").eq(2).attr("src")).toBe("/edc/userimage/"+ this.collection.at(2).get("id") + "?size=icon");
            expect(this.view.$("li img.icon").eq(3).attr("src")).toBe("/edc/userimage/"+ this.collection.at(3).get("id") + "?size=icon");
        });

        it("has a link to the profile for each user in the collection", function() {
            expect(this.view.$('li a.name').eq(0).attr('href')).toBe("#/users/"+this.collection.at(0).get("id"));
            expect(this.view.$('li a.name').eq(1).attr('href')).toBe("#/users/"+this.collection.at(1).get("id"));
            expect(this.view.$('li a.name').eq(2).attr('href')).toBe("#/users/"+this.collection.at(2).get("id"));
            expect(this.view.$('li a.name').eq(3).attr('href')).toBe("#/users/"+this.collection.at(3).get("id"));
        });

        it("has each user's display name in the collection", function() {
            expect(this.view.$('li a.name').eq(0).html()).toContain(this.collection.at(0).displayName());
            expect(this.view.$('li a.name').eq(1).html()).toContain(this.collection.at(1).displayName());
            expect(this.view.$('li a.name').eq(2).html()).toContain(this.collection.at(2).displayName());
            expect(this.view.$('li a.name').eq(3).html()).toContain(this.collection.at(3).displayName());
        });

        it("has each user's Title in the collection", function() {
            expect(this.view.$('li .title:eq(0) .content')).not.toExist();
            expect(this.view.$('li .title:eq(1) .content').html()).toContain(this.collection.at(1).get("title"));
            expect(this.view.$('li .title:eq(2) .content').html()).toContain(this.collection.at(2).get("title"));
            expect(this.view.$('li .title:eq(3) .content')).not.toExist();
        });

        it("has each user's Department in the collection", function() {
            expect(this.view.$('li .ou:eq(0) .content').html()).toContain(this.collection.at(1).get("ou"));
            expect(this.view.$('li .ou:eq(1) .content')).not.toExist();
            expect(this.view.$('li .ou:eq(2) .content')).not.toExist();
            expect(this.view.$('li .ou:eq(3) .content')).not.toExist();
        });

        it("has each user's Notes in the collection", function() {
            expect(this.view.$('li .notes:eq(0) .content').html()).toContain(this.collection.at(0).get("content"));
            expect(this.view.$('li .notes:eq(1) .content').html()).toContain(this.collection.at(1).get("content"));
            expect(this.view.$('li .notes:eq(2) .content')).not.toExist();
            expect(this.view.$('li .notes:eq(3) .content')).not.toExist();
        });

        it("has each user's e-mail in the collection", function() {
            expect(this.view.$('li .email:eq(0) .content')).not.toExist();
            expect(this.view.$('li .email:eq(1) .content').html()).toContain(this.collection.at(1).get("emailAddress"));
            expect(this.view.$('li .email:eq(2) .content').html()).toContain(this.collection.at(2).get("emailAddress"));
            expect(this.view.$('li .email:eq(3) .content')).not.toExist();
        });

        it("has each user's username in the collection", function() {
            expect(this.view.$('li .username:eq(0) .content').html()).toContain(this.collection.at(0).get("name"));
            expect(this.view.$('li .username:eq(1) .content')).not.toExist();
            expect(this.view.$('li .username:eq(2) .content')).not.toExist();
            expect(this.view.$('li .username:eq(3) .content').html()).toContain(this.collection.at(3).get("name"));
        });
    });
});