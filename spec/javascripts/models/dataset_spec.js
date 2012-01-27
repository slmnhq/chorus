describe("chorus.models.Dataset", function() {
    beforeEach(function() {
        this.dataset = fixtures.datasetChorusView({
            workspace : {
                id : "44"
            },
            objectType : "foo",
            objectName : "mama"
        });
    })

    it("creates the correct showUrl", function() {
        expect(this.dataset.showUrl()).toBe("#/workspaces/44/chorus_view/foo/mama");
    })

    describe("#statistics", function() {
        beforeEach(function() {
            this.datasetProperties = this.dataset.statistics()
        })

        it("returns an instance of DatasetStatistics", function() {
            expect(this.datasetProperties).toBeA(chorus.models.DatasetStatistics)
        })

        it("sets the properties correctly", function() {
            expect(this.datasetProperties.get('instanceId')).toBe(this.dataset.get('instance').id)
            expect(this.datasetProperties.get('databaseName')).toBe(this.dataset.get("databaseName"))
            expect(this.datasetProperties.get('schemaName')).toBe(this.dataset.get("schemaName"))
            expect(this.datasetProperties.get('type')).toBe(this.dataset.get("type"))
            expect(this.datasetProperties.get('objectType')).toBe(this.dataset.get("objectType"))
            expect(this.datasetProperties.get('objectName')).toBe(this.dataset.get("objectName"))
        })
    })

    describe("#meta_type", function() {
        var expectedTypeMap = {
            "BASE_TABLE" : "table",
            "VIEW" : "view",
            "EXTERNAL_TABLE" : "table",
            "MASTER_TABLE" : "table"
        }

        _.each(expectedTypeMap, function(str, type) {
            it("works for " + type, function() {
                expect(new chorus.models.Dataset({ objectType : type }).metaType()).toBe(str)
            });
        })
    })

    describe("iconFor", function() {
        var expectedMap = {
            "CHORUS_VIEW" : {
                "" : "view_large.png"
            },

            "SOURCE_TABLE" : {
                "BASE_TABLE" : "source_table_large.png",
                "EXTERNAL_TABLE" : "source_table_large.png",
                "MASTER_TABLE" : "source_table_large.png",
                "VIEW" : "source_view_large.png"
            },

            "SANDBOX_TABLE" : {
                "BASE_TABLE" : "table_large.png",
                "EXTERNAL_TABLE" : "table_large.png",
                "MASTER_TABLE" : "table_large.png",
                "VIEW" : "view_large.png"
            }
        }

        _.each(expectedMap, function(subMap, type) {
            _.each(subMap, function(filename, objectType) {
                it("works for type " + type + " and objectType " + objectType, function() {
                    expect(new chorus.models.Dataset({ type : type, objectType : objectType}).iconUrl()).toBe("/images/" + expectedMap[type][objectType]);
                })
            })
        })
    })
})