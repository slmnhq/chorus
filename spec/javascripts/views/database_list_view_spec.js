describe("chorus.views.DatabaseList", function() {
    beforeEach(function() {
        var object0 = new chorus.models.Base();
        var object1 = new chorus.models.Base();
        object0.cid = 'c44';
        object1.cid = 'c55';
        this.collection = new chorus.models.Collection([object0, object1]);
        spyOn(this.collection.models[0], 'toString').andReturn('object1');
        spyOn(this.collection.models[1], 'toString').andReturn('object2');
        this.view = new chorus.views.DatabaseList({collection: this.collection});
        this.view.template = function() {
            return '<ul class="list"><li data-cid="c44"></li><li data-cid="c55"></li></ul>';
        };
        this.qtipElement = stubQtip();
    });

    context("render", function() {
        beforeEach(function() {
            this.view.render();
        })

        context("when hovering over a function li", function() {
            beforeEach(function() {
                this.view.$('.list li:eq(1)').mouseenter();
            });

            it("has the insert text in the insert arrow", function() {
                expect(this.qtipElement.find("a")).toContainTranslation('database.sidebar.insert')
            })

            context("when clicking the insert arrow", function() {
                beforeEach(function() {
                    spyOnEvent(this.view, "file:insertText");
                    this.qtipElement.find("a").click()
                })

                it("triggers a file:insertText with the string representation", function() {
                    expect("file:insertText").toHaveBeenTriggeredOn(this.view, [this.view.collection.models[1].toString()]);
                })
            })

        })
    })
});
