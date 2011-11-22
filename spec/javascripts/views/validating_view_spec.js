describe("chorus.views.Validating", function() {
    describe("#render", function() {
        beforeEach(function(){
            this.loadTemplate("validating");
            this.model = new chorus.models.Base();
            this.childView = stubView("child");
            this.view = new chorus.views.Validating({model: this.model, childView: this.childView});
        });

        context("with server errors", function() {
            beforeEach(function() {
                this.model.serverErrors = [{message: "error1"}, {message: "error2"}];
                this.view.render();
            });
            it("renders the errors", function() {
                expect(this.view.$('.errors li').length).toBe(2);
                expect(this.view.$('.errors li').eq(0).text()).toBe(this.model.serverErrors[0].message);
                expect(this.view.$('.errors li').eq(1).text()).toBe(this.model.serverErrors[1].message);
            });

            it("renders the childView", function(){
                expect($(this.view.el).find(this.childView.el).length).toBe(1);
            });
        });

        context("without server errors", function() {
            beforeEach(function(){
                this.model.serverErrors = undefined;
                this.view.render();
            });
            
            it("does not render an error div", function() {
                expect(this.view.$('.errors li').length).toBe(0);
            });

            it("renders the childView", function(){
                expect($(this.view.el).find(this.childView.el).length).toBe(1);
            });
        });
    });
});