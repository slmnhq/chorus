describe("chorus.models.DatabaseObjectStatistics", function() {
    describe("#url", function() {
        beforeEach(function() {
            this.databaseObjectStatistics = new chorus.models.DatabaseObjectStatistics()
        })

        describe("#url", function() {
            it("should be right", function() {
                this.databaseObjectStatistics.set({
                    instanceId: 1,
                    databaseName: "%foo%",
                    schemaName: "b/a",
                    type: "CHORUS_VIEW",
                    objectType: "",
                    objectName: "a%pct"
                })

                expect(this.databaseObjectStatistics.url()).toContain("/edc/data/1/database/%25foo%25/schema/b%2Fa");
                expect(this.databaseObjectStatistics.url()).toContain("type=meta");
                expect(this.databaseObjectStatistics.url()).toContain("filter=a%25pct");
            })
        })

        describe("when it has a datasetId property", function() {
            it("uses the dataset API", function() {
                this.databaseObjectStatistics.set({
                    instanceId: 1,
                    databaseName: "theDatabase",
                    schemaName: "theSchema",
                    type: "CHORUS_VIEW",
                    objectType: "",
                    objectName: "anotherName",
                    workspace: {
                        id: 10010
                    }
                })

                this.databaseObjectStatistics.datasetId = "composite|id"

                expect(this.databaseObjectStatistics.url()).toContain("/edc/workspace/10010/dataset/composite%7Cid")
            })
        })
    })
})