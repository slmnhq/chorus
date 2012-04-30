describe("chorus.Mixins.SQLResults", function() {
    var serverFailure = {
        errors: [
            {
                message: "Error!",
                msgcode: null,
                description: null,
                severity: "error",
                msgkey: null
            }
        ],
        response: []
    };

    var taskFailure = {
        errors: [],
        response: {
            state: "failed",
            result: {
                message: "An error happened in the task",
                executeResult: "failed"
            }
        }
    };

    var taskSuccess = {
        errors: [],
        response: {
            executeResult: "success"
        }
    };


    var HostModel;

    beforeEach(function() {
        HostModel = chorus.models.Base.include(chorus.Mixins.SQLResults);
    });

    describe("#errorMessage", function() {
        context("when the model has serverErrors", function() {
            beforeEach(function() {
                this.host = new HostModel({});
                this.host.serverErrors = [
                    {message: "Foo"}
                ]
            });

            it("returns the error message", function() {
                expect(this.host.errorMessage()).toBe("Foo");
            });
        });

        context("when the model does not have serverErrors", function() {
            beforeEach(function() {
                this.host = new HostModel();
            });

            it("returns false", function() {
                expect(this.host.errorMessage()).toBeFalsy();
            });
        });
    });

    describe("#columnOrientedData", function() {
        context("when the host provides custom functions", function() {
            beforeEach(function() {
                HostModel = chorus.models.Base.include(chorus.Mixins.SQLResults).extend({
                    getRows: function() {
                        return this.get("r");
                    },

                    getColumns: function() {
                        return this.get("c");
                    },

                    getSortedRows: function(rows) {
                        return _.sortBy(rows, function(row) {
                            return -1 * row.foo;
                        });
                    },

                    getColumnLabel: function(name) {
                        switch (name) {
                            case "foo":
                                return "A Foo";
                            case "bar":
                                return "A Bar";
                            default:
                                return name;
                        }
                    }
                });

                this.host = new HostModel({
                    c: [
                        {
                            name: "foo",
                            typeCategory: "whatever"
                        },
                        {
                            name: "bar",
                            typeCategory: "what"
                        }
                    ],

                    r: [
                        {
                            "foo": 1,
                            "bar": 3
                        },
                        {
                            "foo": 2,
                            "bar": 4
                        }
                    ]
                });
            });

            it("returns an array of columns containing data", function() {
                var val = this.host.columnOrientedData();
                expect(val.length).toBe(2);

                expect(val[0].name).toBe("A Foo");
                expect(val[0].type).toBe("whatever");
                expect(val[0].values.length).toBe(2);
                expect(val[0].values[0]).toBe(2);
                expect(val[0].values[1]).toBe(1);

                expect(val[1].name).toBe("A Bar");
                expect(val[1].type).toBe("what");
                expect(val[1].values.length).toBe(2);
                expect(val[1].values[0]).toBe(4);
                expect(val[1].values[1]).toBe(3);
            })
        })

        context("when the host does not provide custom functions", function() {
            beforeEach(function() {
                HostModel = chorus.models.Base.include(chorus.Mixins.SQLResults);

                this.host = new HostModel({
                    columns: [
                        {
                            name: "foo",
                            typeCategory: "whatever"
                        },
                        {
                            name: "bar",
                            typeCategory: "what"
                        }
                    ],

                    rows: [
                        {
                            "foo": 1,
                            "bar": 3
                        },
                        {
                            "foo": 2,
                            "bar": 4
                        }
                    ]
                });
            });

            it("provides reasonable defaults", function() {
                var val = this.host.columnOrientedData();
                expect(val.length).toBe(2);

                expect(val[0].name).toBe("foo");
                expect(val[0].type).toBe("whatever");
                expect(val[0].values.length).toBe(2);
                expect(val[0].values[0]).toBe(1);
                expect(val[0].values[1]).toBe(2);

                expect(val[1].name).toBe("bar");
                expect(val[1].type).toBe("what");
                expect(val[1].values.length).toBe(2);
                expect(val[1].values[0]).toBe(3);
                expect(val[1].values[1]).toBe(4);
            })
        })
    })

    describe("dataErrors", function() {
        beforeEach(function() {
            this.hostModel = new (chorus.models.Base.extend(chorus.Mixins.SQLResults));
        });

        it("returns the errors object when there is a server failure", function() {
            expect(this.hostModel.dataErrors(serverFailure)).toEqual(serverFailure.errors)
        })

        it("returns the errors object when there is a task failure", function() {
            expect(this.hostModel.dataErrors(taskFailure)).toEqual([taskFailure.response.result]);
        })
    });
});

