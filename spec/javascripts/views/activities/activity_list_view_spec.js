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
                this.view.render();
            })

            it("has a loading indicator", function() {
                expect(this.view.$(".loading")).toExist();
            });
        });

        describe("when the collection has loaded", function() {
            beforeEach(function() {
                this.collection.loaded = true;
                this.view.render();
            });

            it("should not have a loading element", function() {
                expect(this.view.$(".loading")).not.toExist();
            });

            it("displays the list of activities", function() {
                expect(this.view.$("> li").length).toBe(2);
            });
//
//            it("displays the users' names", function() {
//                _.each(this.view.$("a.name span"), function(el) {
//                    expect($(el).text().trim()).not.toBeEmpty();
//                })
//            })
//
//            it("displays the Administrator tag for admin users", function() {
//                expect(this.view.$("li[data-userName=edcadmin] .administrator")).toExist();
//            });
//
//            it("does not display the Administrator tag for non-admin users", function() {
//                expect(this.view.$("li[data-userName=markr]")).toExist();
//                expect(this.view.$("li[data-userName=markr] .administrator")).not.toExist();
//            });
//
//            it("displays an image for each user", function() {
//                expect(this.view.$("li img").length).toBe(2);
//                expect(this.view.$("li img").attr("src")).toBe(this.collection.models[0].imageUrl({size: "icon"}));
//            });
//
//            it("displays a name for each user", function() {
//                expect(this.view.$("li:nth-child(1) .name").text().trim()).toBe("EDC Admin");
//                expect(this.view.$("li:nth-child(2) .name").text().trim()).toBe("Mark Rushakoff");
//            });
//
//            it("links the user's name to the user show page", function(){
//                expect(this.view.$("li:nth-child(1) a").attr("href")).toBe(this.collection.models[0].showUrl());
//                expect(this.view.$("li:nth-child(2) a").attr("href")).toBe(this.collection.models[1].showUrl());
//            });
//
//            it("links the user's image to the user show page", function(){
//                expect(this.view.$("li:nth-child(1) a img")).toExist();
//                expect(this.view.$("li:nth-child(2) a img")).toExist();
//            });
        });
    })
});
