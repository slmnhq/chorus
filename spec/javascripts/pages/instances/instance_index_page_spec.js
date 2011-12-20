describe("chorus.pages.InstanceIndexPage", function() {
    beforeEach(function() {
    })

    describe("#render", function() {
        beforeEach(function() {
            this.page = new chorus.pages.InstanceIndexPage();
            this.page.render();
        })

        xit("creates an InstanceList view", function() {
            expect(this.page.$(".instance_list")).toExist();
        });
    })
})