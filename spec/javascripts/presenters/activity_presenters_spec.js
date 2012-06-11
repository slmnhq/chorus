describe("chorus.presenters.Activity", function() {
    var model, presenter;

    context("instance created", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.instanceCreated({
                timestamp: "June 11, 2012",
                actor: { firstName: "bomb", lastName: "cherry"},
                target: { name: "kaboom" }
            });

            presenter = new chorus.presenters.Activity(model);
        });

        it("includes the model's timestamp", function() {
            expect(presenter.timestamp).toBe("June 11, 2012");
        });

        describe("#headerHtml", function() {
            var headerHtml;

            beforeEach(function() {
                headerHtml = presenter.headerHtml;
            });

            it("returns a handlebars safe-string (so that html won't be stripped)", function() {
                expect(headerHtml).toBeA(Handlebars.SafeString);
            });

            it("has the right content", function() {
                var headerText = $.stripHtml(headerHtml.toString());
                expect(headerText).toContainTranslation("activity.header.INSTANCE_CREATED.without_workspace", {
                    authorLink: "bomb cherry",
                    objectLink: "kaboom"
                });
            });
        });
    });
});


