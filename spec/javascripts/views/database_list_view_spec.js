describe("chorus.views.DatabaseList", function() {
    beforeEach(function() {
        var object0 = new chorus.models.DatabaseTable();
        var object1 = new chorus.models.DatabaseTable();
        object0.cid = 'c44';
        object1.cid = 'c55';
        this.sandbox = fixtures.sandbox();
        this.collection = new chorus.collections.Base([object0, object1]);
        spyOn(this.collection.models[0], 'toText').andReturn('object1');
        spyOn(this.collection.models[1], 'toText').andReturn('object2');
        this.view = new chorus.views.DatabaseList({collection: this.collection, sandbox: this.sandbox });
        this.view.template = function() {
            return '<ul class="list"><li data-cid="c44"><a>as</a></li><li data-cid="c55"><a>gd</a></li></ul>';
        };
        this.qtipElement = stubQtip();
    });

    context("render", function() {
        beforeEach(function() {
            spyOn(this.view, 'closeQtip');
            this.view.render();
        })

        context("when hovering over a collection li", function() {
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
                    expect("file:insertText").toHaveBeenTriggeredOn(this.view, [this.view.collection.models[1].toText()]);
                })
            })

            context("when clicking a link within the li", function() {
                beforeEach(function() {
                    this.view.$('.list li:eq(1) a').click()
                })

                it("closes the open insert arrow", function() {
                    expect(this.view.closeQtip).toHaveBeenCalled();
                })
            })

        })
    })
});
