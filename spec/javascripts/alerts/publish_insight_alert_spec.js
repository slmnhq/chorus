describe("chorus.alerts.PublishInsight", function() {
    beforeEach(function() {
        this.activity = fixtures.activity();
    });

    context("when publishing", function() {
        beforeEach(function() {
            spyOn(this.activity, "publish");
            this.alert = new chorus.alerts.PublishInsight({ model : this.activity, publish: true });
            this.alert.render();
        });
        it("displays the confirmation message", function() {
            var title = this.alert.$("h1").text().trim();
            expect(title).toMatchTranslation("insight.publish.alert.title");
            expect(this.alert.$("p").text().trim()).toMatchTranslation("insight.publish.alert.body");
            expect(this.alert.$("button.submit").text().trim()).toMatchTranslation("insight.publish.alert.button");
        });

        it("calls the model's publish method when the submit button is clicked", function() {
            this.alert.$("button.submit").click();

            expect(this.activity.publish).toHaveBeenCalled();
        });

        it("closes when the submit button is clicked", function() {
            spyOnEvent($(document), "close.facebox");
            this.alert.$("button.submit").click();
            expect("close.facebox").toHaveBeenTriggeredOn($(document))
        });
    });

    context("when unpublishing", function() {
        beforeEach(function() {
            spyOn(this.activity, "unpublish");
            this.alert = new chorus.alerts.PublishInsight({ model : this.activity, publish: false });
            this.alert.render();
        });

        it("displays the confirmation message", function() {
            var title = this.alert.$("h1").text().trim();
            expect(title).toMatchTranslation("insight.unpublish.alert.title");
            expect(this.alert.$("p").text().trim()).toMatchTranslation("insight.unpublish.alert.body");
            expect(this.alert.$("button.submit").text().trim()).toMatchTranslation("insight.unpublish.alert.button");
        });

        it("calls the model's unpublish method when the submit button is clicked", function() {
            this.alert.$("button.submit").click();

            expect(this.activity.unpublish).toHaveBeenCalled();
        });
    });


})