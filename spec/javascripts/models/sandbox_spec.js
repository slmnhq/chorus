describe("chorus.models.Sandbox", function() {
    beforeEach(function() {
        this.model = new chorus.models.Sandbox({ workspaceId: '123', id: '456' });
    });

    describe("#url", function() {
        context("when creating", function() {
            it("has the right url", function() {
                var uri = new URI(this.model.url({ method: "create" }));
                expect(uri.path()).toBe("/edc/workspace/123/sandbox");
            });
        });
    });

    describe("#beforeSave", function() {
        it("sets the 'type' field as required by the api", function() {
            this.model.save({ instance: '22', database: '11', schema: '33' });
            expect(this.model.get("type")).toBe("000");

            this.model.clear();
            this.model.save({ instance: '22', database: '11', schemaName: "baz" });
            expect(this.model.get("type")).toBe("001");

            this.model.clear();
            this.model.save({ instance: '22', databaseName: "foobar", schemaName: "meow" });
            expect(this.model.get("type")).toBe("011");
        });
    });

    describe("validations", function() {
        beforeEach(function() {
            this.model.set({
                instance: '1',
                database: '2',
                schema: '3'
            });
            expectValid({}, this.model);
        });

        it("requires an instance id", function() {
            expectInvalid({ instance: "" }, this.model);
        });

        context("with a database id", function() {
            context("without a schema id", function() {
                beforeEach(function() {
                    this.model.set({ schema: "" });
                });

                it("requires a schema name", function() {
                    expectInvalid({ schemaName: "" }, this.model);
                });

                it("requires that the schema name not start with a number", function() {
                    expectInvalid({ schemaName: "3friends_of_the_forest" }, this.model);
                    expectValid({ schemaName: "friends_of_the_forest" }, this.model);
                });

                it("requires that the schema name does NOT contain whitespace", function() {
                    expectInvalid({ schemaName: "friends of the forest" }, this.model);
                });
            });
        });

        context("without a database id", function() {
            beforeEach(function() {
                this.model.set({ database: "", databaseName: "bernards_db", schemaName: "cool_schema" });
                expectValid({}, this.model);
            });

            it("requires a database name", function() {
                expectInvalid({ databaseName: "" }, this.model);
            });

            it("requires that the database name not start with a number", function() {
                expectInvalid({ databaseName: "3friends_of_the_forest" }, this.model);
            });

            it("requires that the database name does NOT contain whitespace", function() {
                expectInvalid({ databaseName: "friends of the forest" }, this.model);
            });

            it("requires a schema name", function() {
                expectInvalid({ schemaName: "" }, this.model);
            });

            context("when a schema name is specified", function() {
                it("requires that the name not start with a number", function() {
                    expectInvalid({ schemaName: "3friends_of_the_forest" }, this.model);
                });

                it("requires that the name does NOT contain whitespace", function() {
                    expectInvalid({ schemaName: "friends of the forest" }, this.model);
                });
            });
        });
    });

    function expectValid(attrs, model) {
        model.performValidation(attrs);
        expect(model.isValid()).toBeTruthy();
    }

    function expectInvalid(attrs, model) {
        model.performValidation(attrs);
        expect(model.isValid()).toBeFalsy();
    }
});
