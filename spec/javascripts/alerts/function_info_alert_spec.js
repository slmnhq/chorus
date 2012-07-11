xdescribe("chorus.alerts.FunctionInfo", function() {
    var model, alert;
    
    beforeEach(function() {
        model = rspecFixtures.schemaFunctionSet([{
            name: "infinite_loop",
            argTypes: [ "text", "int4", "float64" ],
            argNames: [ "name", "age", "height" ],
            definition: "while (true) {}",
            description: "this is a great function",
            returnType: "beverage"
        }]).at(0);

        var link = $("<a/>").data("model", model);
        alert = new chorus.alerts.FunctionInfo({ launchElement: link });
        alert.render();
    });

    it("displays the function's name, return type and parameters", function() {
        expect(alert.$(".left p")).toContainText("infinite_loop");
        expect(alert.$(".left p")).toContainText("beverage");
        expect(alert.$(".left p")).toContainText(model.formattedArgumentList());
    });

    it("displays the function's description and definition", function() {
        expect(alert.$(".body")).toContainTranslation("schema.functions.description");
        expect(alert.$(".body")).toContainTranslation("schema.functions.definition");

        expect(alert.$(".body .description")).toContainText("this is a great function");
        expect(alert.$(".body .definition")).toContainText("while (true) {}");
    });

    context("when the function has no description", function () {
        it("doesn't include the 'description' label", function () {
            model.unset("description");
            alert.render();
            expect(alert.$(".body")).not.toContainTranslation("schema.functions.description")
        });
    });

    it("has the 'info' class (so that it displays the right icon)", function() {
        expect($(alert.el)).toHaveClass("info");
    });

    it("only has one button", function() {
        expect(alert.$("button.submit")).toHaveClass("hidden");
    });
});
