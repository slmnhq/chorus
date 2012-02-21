describe("chorus.models.TabularData", function() {
    beforeEach(function() {
        this.tabularData = fixtures.tabularData();
    })

    describe("#statistics", function() {
        beforeEach(function() {
            this.tabularDataProperties = this.tabularData.statistics()
        })

        it("returns an instance of DatabaseObjectStatistics", function() {
            expect(this.tabularDataProperties).toBeA(chorus.models.DatabaseObjectStatistics)
        })

        it("should memoize the result", function() {
            expect(this.tabularDataProperties).toBe(this.tabularData.statistics());
        })

        it("sets the properties correctly", function() {
            expect(this.tabularDataProperties.get('instanceId')).toBe(this.tabularData.get('instance').id)
            expect(this.tabularDataProperties.get('databaseName')).toBe(this.tabularData.get("databaseName"))
            expect(this.tabularDataProperties.get('schemaName')).toBe(this.tabularData.get("schemaName"))
            expect(this.tabularDataProperties.get('type')).toBe(this.tabularData.get("type"))
            expect(this.tabularDataProperties.get('objectType')).toBe(this.tabularData.get("objectType"))
            expect(this.tabularDataProperties.get('objectName')).toBe(this.tabularData.get("objectName"))
        })
    })

    describe("#deriveChorusView", function() {
        beforeEach(function() {
            this.chorusView = this.tabularData.deriveChorusView();
        });

        it("returns a chorus view", function() {
            expect(this.chorusView).toBeA(chorus.models.ChorusView);
        });

        it("has the right 'sourceObject'", function() {
            expect(this.chorusView.sourceObject).toBe(this.tabularData);
        });
    });

    describe("iconFor", function() {
        var largeIconMap = {
            "CHORUS_VIEW": {
                "QUERY": "view_large.png"
            },

            "SOURCE_TABLE": {
                "BASE_TABLE": "source_table_large.png",
                "EXTERNAL_TABLE": "source_table_large.png",
                "MASTER_TABLE": "source_table_large.png",
                "VIEW": "source_view_large.png"
            },

            "SANDBOX_TABLE": {
                "BASE_TABLE": "table_large.png",
                "EXTERNAL_TABLE": "table_large.png",
                "MASTER_TABLE": "table_large.png",
                "VIEW": "view_large.png",
                "HDFS_EXTERNAL_TABLE": "table_large.png"
            }
        };

        var smallIconMap = {
            "CHORUS_VIEW": {
                "QUERY": "view_small.png"
            },

            "SOURCE_TABLE": {
                "BASE_TABLE": "source_table_small.png",
                "EXTERNAL_TABLE": "source_table_small.png",
                "MASTER_TABLE": "source_table_small.png",
                "VIEW": "source_view_small.png"
            },

            "SANDBOX_TABLE": {
                "BASE_TABLE": "table_small.png",
                "EXTERNAL_TABLE": "table_small.png",
                "MASTER_TABLE": "table_small.png",
                "VIEW": "view_small.png",
                "HDFS_EXTERNAL_TABLE": "table_small.png"
            }
        };

        describe("when the 'size' option is set to 'small'", function() {
            it("returns the small version of the icon of the appropriate type", function() {
                _.each(smallIconMap, function(subMap, type) {
                    _.each(subMap, function(filename, objectType) {

                        var model = fixtures.tabularData({ type: type, objectType: objectType});
                        expect(model.iconUrl({ size: "small" })).toBe("/images/" + filename);

                    });
                });
            });
        });

        describe("when the 'size' option is set to 'large'", function() {
            it("returns the large version of the icon of the appropriate type", function() {
                _.each(largeIconMap, function(subMap, type) {
                    _.each(subMap, function(filename, objectType) {

                        var model = fixtures.tabularData({ type: type, objectType: objectType});
                        expect(model.iconUrl({ size: "large" })).toBe("/images/" + filename);

                    });
                });
            });
        });

        describe("when no 'size' option is given", function() {
            it("returns the large version of the icon of the appropriate type", function() {
                _.each(largeIconMap, function(subMap, type) {
                    _.each(subMap, function(filename, objectType) {

                        var model = fixtures.tabularData({ type: type, objectType: objectType});
                        expect(model.iconUrl()).toBe("/images/" + filename);

                    });
                });
            });
        });
    })

    describe("#schema", function() {
        it("returns a new schema with the right attributes", function() {
            var schema = this.tabularData.schema();

            expect(schema.get("instanceId")).toBe(this.tabularData.get("instance").id);
            expect(schema.get("databaseName")).toBe(this.tabularData.get("databaseName"));
            expect(schema.get("name")).toBe(this.tabularData.get("schemaName"));
            expect(schema.get("instanceName")).toBe(this.tabularData.get("instance").name);
        });
    });

    describe("#lastComment", function() {
        beforeEach(function() {
            this.model = fixtures.tabularData();
            this.comment = this.model.lastComment();
            this.lastCommentJson = this.model.get('recentComment');
        });

        it("has the right body", function() {
            expect(this.comment.get("body")).toBe(this.lastCommentJson.text);
        });

        it("has the right creator", function() {
            var creator = this.comment.author()
            expect(creator.get("id")).toBe(this.lastCommentJson.author.id);
            expect(creator.get("firstName")).toBe(this.lastCommentJson.author.firstName);
            expect(creator.get("lastName")).toBe(this.lastCommentJson.author.lastName);
        });

        context("when the data doesn't have any comments", function() {
            it("returns null", function() {
                expect(fixtures.tabularData({recentComment: null}).lastComment()).toBeFalsy();
            });
        });
    });

    describe("#metaType", function() {
        var expectedTypeMap = {
            "BASE_TABLE": "table",
            "VIEW": "view",
            "QUERY": "query",
            "EXTERNAL_TABLE": "table",
            "MASTER_TABLE": "table",
            "CHORUS_VIEW": "view"
        }

        _.each(expectedTypeMap, function(str, type) {
            it("works for " + type, function() {
                expect(fixtures.tabularData({ objectType: type }).metaType()).toBe(str)
            });
        })
    });

    describe("#entity_type", function() {
        var expectedEntityTypeMap = {
            "SOURCE_TABLE": "databaseObject",
            "SANDBOX_TABLE": "databaseObject",
            "CHORUS_VIEW": "chorusView"
        }

        _.each(expectedEntityTypeMap, function(str, type) {
            it("works for " + type, function() {
                expect(fixtures.tabularData({ type: type }).getEntityType()).toBe(str);
            });
        })
    })

    describe("the entity_type object attribute", function() {
        it("is recalculated when the 'type' attribute is changed", function() {
            expect(this.tabularData.entityType).toBe("databaseObject");
            this.tabularData.set({ type: "CHORUS_VIEW" })
            expect(this.tabularData.entityType).toBe("chorusView");
        })
    })

    describe("#preview", function() {
        context("with a table", function() {
            beforeEach(function() {
                this.tabularData.set({objectType: "BASE_TABLE", objectName: "foo"});
                this.preview = this.tabularData.preview();
            });

            checkPreview();

            it("should return a database preview", function() {
                expect(this.preview.get("instanceId")).toBe(this.tabularData.get("instance").id);
                expect(this.preview.get("databaseName")).toBe(this.tabularData.get("databaseName"));
                expect(this.preview.get("schemaName")).toBe(this.tabularData.get("schemaName"));
                expect(this.preview.get("tableName")).toBe(this.tabularData.get("objectName"));
            });
        });

        context("with a view", function() {
            beforeEach(function() {
                this.tabularData.set({objectType: "VIEW", objectName: "bar"});
                this.preview = this.tabularData.preview();
            });

            checkPreview();

            it("should return a database preview", function() {
                expect(this.preview.get("instanceId")).toBe(this.tabularData.get("instance").id);
                expect(this.preview.get("databaseName")).toBe(this.tabularData.get("databaseName"));
                expect(this.preview.get("schemaName")).toBe(this.tabularData.get("schemaName"));
                expect(this.preview.get("viewName")).toBe(this.tabularData.get("objectName"));
            });
        });

        context("with a chorus view", function() {
            beforeEach(function() {
                this.tabularData.set({id: "2|dca_demo|some_schema|BASE_TABLE|Dataset1", objectType: "QUERY", objectName: "my_chorusview", workspace: {id:"234", name: "abc"}});
                this.preview = this.tabularData.preview();
            });

            checkPreview();

            it("should return a dataset preview", function() {
                expect(this.preview.get("workspaceId")).toBe(this.tabularData.get("workspace").id);
                expect(this.preview.get("datasetId")).toBe(this.tabularData.get("id"));
            })
        });

        context("with a chorus view query ( when editing a chorus view )", function() {
            beforeEach(function() {
                this.tabularData.set({workspace: {id: "111", name: "abc"} , query: "select * from hello_world"});
                this.preview = this.tabularData.preview(true);
            });

            checkPreview();

            it("should return a dataset query preview", function() {
                expect(this.preview.get("query")).toBe("select * from hello_world");
                expect(this.preview.get("workspaceId")).toBe("111");
            });
        })

        function checkPreview() {
            it("should return a DatasetPreview", function() {
                expect(this.preview).toBeA(chorus.models.TabularDataPreview);
            });

            it("should memoize the database preview", function() {
                expect(this.preview).toBe(this.tabularData.preview());
            });
        }
    });

    describe("#instance", function() {
        beforeEach(function() {
            this.instance = this.tabularData.instance();
        });

        it("returns an instance with the right id and name", function() {
            expect(this.instance).toBeA(chorus.models.Instance);
            expect(this.instance.get("id")).toBe(this.tabularData.get("instance").id);
            expect(this.instance.get("name")).toBe(this.tabularData.get("instance").name);
        });

        it("memoizes", function() {
            expect(this.instance).toBe(this.tabularData.instance());
        });
    });

    describe("#columns", function() {
        it("should memoize the result", function() {
            expect(this.tabularData.columns()).toBe(this.tabularData.columns());
        });

        it("should return a DatabaseColumnSet", function() {
            expect(this.tabularData.columns()).toBeA(chorus.collections.DatabaseColumnSet);
        })

        it("should have a reference back to the tabularData", function() {
            expect(this.tabularData.columns().attributes.tabularData).toBe(this.tabularData);
        })

        it("should pass the correct parameters to the DatabaseColumnSet", function() {
            var columns = this.tabularData.columns();
            expect(columns.attributes.instanceId).toBe(this.tabularData.get("instance").id);
            expect(columns.attributes.databaseName).toBe(this.tabularData.get("databaseName"));
            expect(columns.attributes.schemaName).toBe(this.tabularData.get("schemaName"));
        });

        context("when the object has a metaType of 'query'", function() {
            beforeEach(function() {
                spyOn(this.tabularData, 'metaType').andReturn('query');
                this.tabularData.set({ id: "ID" });
            });

            it("has a queryName of the tabularData id", function() {
                var columns = this.tabularData.columns();
                expect(columns.attributes.queryName).toBe(this.tabularData.get('id'));
            });
        });

        context("when the object is a table", function() {
            beforeEach(function() {
                this.tabularData.set({ objectType: "SOURCE_TABLE" });
            });

            it("passes its name to the column set as 'tableName'", function() {
                var columns = this.tabularData.columns();
                expect(columns.attributes.tableName).toBe(this.tabularData.get("objectName"));
                expect(columns.attributes.viewName).toBeFalsy();
            });
        });

        context("when the object is a view", function() {
            beforeEach(function() {
                this.tabularData.set({ objectType: "VIEW" });
            });

            it("passes its name to the column set as 'viewName'", function() {
                var columns = this.tabularData.columns();
                expect(columns.attributes.viewName).toBe(this.tabularData.get("objectName"));
                expect(columns.attributes.tableName).toBeFalsy();
            });
        });
    });

    describe("#quotedName", function() {
        beforeEach(function() {
            this.tabularData.set({objectName: "My_Object"});
        });

        it("uses the safePGName helper", function() {
            expect(this.tabularData.quotedName()).toBe(chorus.Mixins.dbHelpers.safePGName(this.tabularData.get("objectName")));
        });
    });

});
