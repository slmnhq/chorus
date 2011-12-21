describe("chorus.views.InstanceList", function() {
    beforeEach(function() {
        this.collection = new chorus.models.InstanceSet();
        this.collection.add(fixtures.instance({instanceProvider : "Greenplum Database"}));
        this.collection.add(fixtures.instance({instanceProvider : "Greenplum Database"}));
        this.collection.add(fixtures.instance({instanceProvider : "Greenplum Database"}));
        this.collection.add(fixtures.instance({instanceProvider : "Hadoop"}));
        this.collection.add(fixtures.instance({instanceProvider : "Hadoop"}));

        this.view = new chorus.views.InstanceList({collection: this.collection});
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("renders an item for each instance", function(){
            expect(this.view.$("li.instance").length).toBe(this.collection.length);
        });

        it("renders the three instance provider sections", function() {
            expect(this.view.$("div.instance_provider").length).toBe(3);
        });

        it("renders the details section in each instance provider section", function() {
            expect(this.view.$("div.instance_provider .details").length).toBe(3);
        });

        it("renders the greenplum instances in the correct instance div", function() {
            expect(this.view.$(".greenplum_instance li.instance").length).toBe(3);
        });
        it("renders the hadoop instances in the correct instance div", function() {
            expect(this.view.$(".hadoop_instance li.instance").length).toBe(2);
        });
    });
});