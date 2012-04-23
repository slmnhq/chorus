describe("chorus.Mixins.SQLResults", function() {
    var serverFailure = {
        message: [
            {
            message: "Error!",
            msgcode: null,
            description: null,
            severity: "error",
            msgkey: null
        }
        ],
        status: "fail",
        resource: [ ]
    };

    var taskFailure = {
        "message": [],
        "status": "ok",
        "resource": [
            {
            "state": "failed",
            "result": {
                "message": "An error happened in the task",
                "executeResult": "failed"
            }
        }
        ]
    };

    var taskSuccess = {
        message: [],
        resource: [
            {
            executeResult: "success"
        }
        ],
        status: "ok"
    };

    describe("#errorMessage", function() {
        beforeEach(function() {
            this.hostModel = chorus.models.Base.extend(_.extend({}, chorus.Mixins.SQLResults, {
            }));
        });

        context("when the model has serverErrors", function() {
            beforeEach(function() {
                this.host = new this.hostModel({});
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
                this.host = new this.hostModel();
            });

            it("returns false", function() {
                expect(this.host.errorMessage()).toBeFalsy();
            });
        });
    });

    describe("#columnOrientedData", function() {
        context("when the host provides custom functions", function() {
            beforeEach(function() {
                this.hostModel = chorus.models.Base.extend(_.extend({}, chorus.Mixins.SQLResults, {
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
                }));

                this.host = new this.hostModel({
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
                this.hostModel = chorus.models.Base.extend(_.extend({}, chorus.Mixins.SQLResults, {
                }));

                this.host = new this.hostModel({
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

    describe("dataStatusOk", function() {
        beforeEach(function() {
            this.hostModel = new (chorus.models.Base.extend(chorus.Mixins.SQLResults));
        });

        context("when there is a server failure", function() {
            beforeEach(function() {
                this.data = serverFailure;
            });

            it("returns false", function() {
                expect(this.hostModel.dataStatusOk(this.data)).toBeFalsy();
            })
        });

        context("when there is a task failure", function() {
            beforeEach(function() {
                this.data = taskFailure;
            });

            it("returns false", function() {
                expect(this.hostModel.dataStatusOk(this.data)).toBeFalsy();
            })
        });

        context("when the task succeeds", function() {
            beforeEach(function() {
                this.data = taskSuccess;
            });

            it("returns true", function() {
                expect(this.hostModel.dataStatusOk(this.data)).toBeTruthy();
            })
        });
    });

    describe("dataErrors", function() {
        beforeEach(function() {
            this.hostModel = new (chorus.models.Base.extend(chorus.Mixins.SQLResults));
        });

        context("when there is a server failure", function() {
            beforeEach(function() {
                this.data = serverFailure;
            });

            it("returns the errors object", function() {
                expect(this.hostModel.dataErrors(this.data)).toEqual(this.data.message)
            })
        });

        context("when there is a task failure", function() {
            beforeEach(function() {
                this.data = taskFailure;
            });

            it("returns the errors object", function() {
                expect(this.hostModel.dataErrors(this.data)).toEqual([this.data.resource[0].result]);
            })
        });
    });
});

