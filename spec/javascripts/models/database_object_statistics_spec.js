describe("chorus.models.DatabaseObjectStatistics", function() {
    describe("#url", function() {
        beforeEach(function() {
            this.databaseObjectStatistics = new chorus.models.DatabaseObjectStatistics()
        })

        describe("#url", function() {
            it("should call the right API when the metaType is a table", function() {
                this.databaseObjectStatistics.set({
                    instanceId: 1,
                    databaseName: "%foo%",
                    schemaName: "b/a",
                    type: "CHORUS_VIEW",
                    objectType: "",
                    objectName: "a%pct",
                    metaType: "table"
                })

                expect(this.databaseObjectStatistics.url()).toContain("/data/1/database/%25foo%25/schema/b%2Fa/table/a%25pct")
            })

            it("calls the right API when the metaType is a view", function() {
                this.databaseObjectStatistics.set({
                    instanceId: 1,
                    databaseName: "%foo%",
                    schemaName: "b/a",
                    type: "CHORUS_VIEW",
                    objectType: "",
                    objectName: "a%pct",
                    metaType: "view"
                })

                expect(this.databaseObjectStatistics.url()).toContain("/data/1/database/%25foo%25/schema/b%2Fa/view/a%25pct")
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

                expect(this.databaseObjectStatistics.url()).toContain("/workspace/10010/dataset/composite%7Cid")
            })
        })
    })
})