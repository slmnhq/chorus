describe("jscrollpane", function() {
    describe("setupScrolling", function() {
        beforeEach(function() {
            this.container = $('<div></div>');
            this.container.css('width', "100px")
            this.content = $('<div></div>');
            this.container.append(this.content);
            $('#jasmine_content').append(this.container);
        });
        context("for border-box containers", function() {
            beforeEach(function() {
                this.container.css('box-sizing', 'border-box');
                this.container.css('-moz-box-sizing', 'border-box');
            });
            context("when container has max-height and the contents fix", function() {
                beforeEach(function() {
                    this.container.css('max-height', '40px');
                    this.container.css('padding-top', '5px');
                    this.content.css('height', '35px');
                })
                it("does not have scroll bars", function() {
                    this.container.jScrollPane();
                    expect(this.container).not.toHaveClass('jspScrollable');
                })
            })
        })
    })
})