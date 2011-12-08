describe("chorus.views.UserList", function() {
    beforeEach(function() {
        this.loadTemplate("user_list");
        this.loadTemplate("main_content");
        fixtures.model = 'UserSet';
    });

    describe("#render", function() {
        describe("when the collection has loaded", function() {
            beforeEach(function() {
                this.collection = fixtures.modelFor('fetch');
                this.collection.loaded = true;
                this.view = new chorus.views.UserList({collection: this.collection});
                this.view.render();
            });

            it("should not have a loading element", function() {
                expect(this.view.$(".loading")).not.toExist();
            });

            it("displays the list of users", function() {
                expect(this.view.$("> li").length).toBe(3);
            });

            it("displays the users' names", function() {
                _.each(this.view.$("a.name span"), function(el) {
                    expect($(el).text().trim()).not.toBeEmpty();
                })
            })

            it("displays the users' title", function() {
                    expect(this.view.$("a[title=title] .title")).not.toBeEmpty();
            })

            it("sets title attributes", function() {
                var self = this;

                _.each(this.view.$("a.name span"), function(el, index) {
                    var model = self.collection.at(index);
                    expect($(el).attr("title")).toBe([model.get("firstName"), model.get("lastName")].join(' '));
                })
            })

            it("displays the Administrator tag for admin users", function() {
                expect(this.view.$("li[data-userId=10001] .administrator")).toExist();
            });

            it("does not display the Administrator tag for non-admin users", function() {
                expect(this.view.$("li[data-userId=10000]")).toExist();
                expect(this.view.$("li[data-userId=10000] .administrator")).not.toExist();
            });

            it("displays an image for each user", function() {
                expect(this.view.$("li img").length).toBe(3);
                expect(this.view.$("li img").attr("src")).toBe(this.collection.models[0].imageUrl({size: "icon"}));
            });

            it("displays a name for each user", function() {
                expect(this.view.$("li:nth-child(1) .name").text().trim()).toBe("Mark Rushakoff");
                expect(this.view.$("li:nth-child(2) .name").text().trim()).toBe("EDC Admin");
            });

            it("links the user's name to the user show page", function(){
                expect(this.view.$("li:nth-child(1) a").attr("href")).toBe(this.collection.models[0].showUrl());
                expect(this.view.$("li:nth-child(2) a").attr("href")).toBe(this.collection.models[1].showUrl());
            });

            it("links the user's image to the user show page", function(){
                expect(this.view.$("li:nth-child(1) a img")).toExist();
                expect(this.view.$("li:nth-child(2) a img")).toExist();
            });
        });
    })
});
