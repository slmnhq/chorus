describe("chorus.models.Workfile", function() {
    beforeEach(function() {
        this.model = rspecFixtures.workfile.sql({workspace: { id: "10000"}, id: '10020'});
    });

    describe("#modifier", function() {
        it("returns a partially constructed user, based on the workfile's modifier attribute", function() {
            var modifier = this.model.modifier();
            expect(modifier.get("firstName")).toBe(this.model.get("versionInfo").modifier.firstName);
            expect(modifier.get("lastName")).toBe(this.model.get("versionInfo").modifier.lastName);
            expect(modifier.get("id")).toBe(this.model.get("versionInfo").modifier.id);
        });
    });

    describe("#workspace", function() {
        it("returns a workspace", function() {
            expect(this.model.workspace()).toBeA(chorus.models.Workspace);
        });

        it("memoizes", function() {
            expect(this.model.workspace()).toBe(this.model.workspace());
        });
    });

    describe("#executionSchema", function() {
        context("when the workfile is not loaded", function() {
            beforeEach(function() {
                this.model.clear();
                delete this.model.loaded;
            })

            it("returns undefined", function() {
                expect(this.model.executionSchema()).toBeUndefined();
            });
        })

        context("when the workfile's workspace has a sandbox", function() {
            beforeEach(function() {
                this.model.workspace().set({
                    sandboxInfo: {
                        databaseId: "4",
                        databaseName: "db",
                        instanceId: "5",
                        instanceName: "instance",
                        sandboxId: "10001",
                        schemaId: "6",
                        schemaName: "schema"
                    }
                });
            })

            context("when the workfile has never been executed", function() {
                it("returns the sandbox's schema", function() {
                    var schema = this.model.executionSchema();
                    expect(schema.database().instance().id).toBe('5');
                    expect(schema.database().instance().name()).toBe('instance');
                    expect(schema.database().id).toBe('4');
                    expect(schema.database().name()).toBe('db');
                    expect(schema.get("id")).toBe('6');
                    expect(schema.get("name")).toBe('schema');
                });
            })

            context("when the workfile was last executed in a schema other than its sandbox's schema", function() {
                beforeEach(function() {
                    this.model.set({ executionInfo: {
                        instanceId: '51',
                        instanceName: "ned",
                        databaseId: '52',
                        databaseName: "rob",
                        schemaId: '53',
                        schemaName: "louis"
                    }});
                });

                it("returns that schema", function() {
                    var schema = this.model.executionSchema();
                    expect(schema.database().instance().id).toBe('51');
                    expect(schema.database().instance().name()).toBe('ned');
                    expect(schema.database().id).toBe('52');
                    expect(schema.database().name()).toBe('rob');
                    expect(schema.get("id")).toBe('53');
                    expect(schema.get("name")).toBe('louis');
                });
            });

            context("when the workfile was last executed in a its sandbox schema", function() {
                beforeEach(function() {
                    this.model.set({ executionInfo: {
                        databaseId: "4",
                        databaseName: "db",
                        instanceId: "5",
                        instanceName: "instance",
                        sandboxId: "10001",
                        schemaId: "6",
                        schemaName: "schema"
                    }});
                });

                it("returns the sandbox's schema", function() {
                    var schema = this.model.executionSchema();
                    expect(schema.database().instance().id).toBe('5');
                    expect(schema.database().instance().name()).toBe('instance');
                    expect(schema.database().id).toBe('4');
                    expect(schema.database().name()).toBe('db');
                    expect(schema.get("id")).toBe('6');
                    expect(schema.get("name")).toBe('schema');
                });
            })
        })

        context("when the workfile's workspace does not have a sandbox", function() {
            it("returns undefined", function() {
                expect(this.model.executionSchema()).toBeUndefined();
            });
        })
    });

    describe("#sandbox", function() {
        context("when the workfile's workspace has been fetched", function() {
            beforeEach(function() {
                spyOn(this.model, "workspace").andReturn(rspecFixtures.workspace({
                    sandboxInfo: {
                        databaseId: 4,
                        databaseName: "db",
                        instanceId: 5,
                        instanceName: "instance",
                        sandboxId: "10001",
                        schemaId: 6,
                        schemaName: "schema"
                    }
                }))
            });

            it("returns the sandbox from the workspace", function() {
                expect(this.model.sandbox()).toBeA(chorus.models.Sandbox);
            });
        })

        context("when the workfile's workspace has not been fetched", function() {
            it("returns undefined", function() {
                expect(this.model.sandbox()).toBeFalsy();
            });
        })
    });

    xdescribe("#lastComment", function() {
        beforeEach(function() {
            this.comment = this.model.lastComment();
            this.lastCommentJson = this.model.get('recentComments')[0];
        });

        it("has the right body", function() {
            expect(this.comment.get("body")).toBe(this.lastCommentJson.text);
        });

        it("sets the 'loaded' flag to true", function() {
            expect(this.comment.loaded).toBeTruthy();
        });

        it("has the right creator", function() {
            var creator = this.comment.author()
            expect(creator.get("id")).toBe(this.lastCommentJson.author.id);
            expect(creator.get("firstName")).toBe(this.lastCommentJson.author.firstName);
            expect(creator.get("lastName")).toBe(this.lastCommentJson.author.lastName);
        });

        context("when the workfile doesn't have any comments", function() {
            it("returns null", function() {
                expect(new chorus.models.Workfile().lastComment()).toBeFalsy();
            });
        });
    });

    describe("validation", function() {
        beforeEach(function() {
            spyOn(this.model, "require").andCallThrough();
        });

        it("should return a truthy value for a valid workspace", function() {
            expect(this.model.performValidation()).toBeTruthy();
        });

        it("requires fileName", function() {
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("fileName", undefined);
        });
    });

    describe("urls", function() {
        beforeEach(function() {
            this.model = rspecFixtures.workfile.sql({
                id: 5,
                workspace: { id: 10 },
                versionInfo: { contentUrl: "this/is/content/url" }
            });
        });

        it("has the right backend URL", function() {
            expect(this.model.url()).toBe("/workfiles/5");
        });

        describe("#showUrl", function() {
            context("when the workfile is the most recent version", function() {
                it("does not include a version", function() {
                    this.model.get('versionInfo').versionNum = 1;
                    this.model.set({ latestVersionNum: 1 })
                    expect(this.model.showUrl()).toBe("#/workspaces/10/workfiles/5")
                });
            });

            context("when the workfile is not the most recent version", function() {
                it("includes its version number", function() {
                    this.model.get("versionInfo").versionNum = 6
                    this.model.set({latestVersionNum: 9 })
                    expect(this.model.showUrl()).toBe("#/workspaces/10/workfiles/5/versions/6")
                });
            });

            context("when a 'version' option is passed", function() {
                it("uses that version", function() {
                    expect(this.model.showUrl({ version: 72 })).toBe("#/workspaces/10/workfiles/5/versions/72")
                });
            });
        });

        it("has the right download URL", function() {
            expect(this.model.downloadUrl()).toBe("this/is/content/url");
        });

        xcontext("when the workfile is a draft", function() {
            beforeEach(function() {
                this.model.set({ hasDraft: true })
                spyOn(chorus, "cachebuster").andReturn(12345);
            });

            it("has the right download URL", function() {
                expect(this.model.downloadUrl()).toBe("/workfiles/5/file/99999?download=true&iebuster=12345");
            });
        })
    });

    describe("isImage", function() {
        context("when the workfile is an image", function() {
            it("returns true", function() {
                var workfile = rspecFixtures.workfile.image();
                expect(workfile.isImage()).toBeTruthy();
            });
        });

        context("when the workfile is NOT an image", function() {
            it("returns false", function() {
                var workfile = rspecFixtures.workfile.sql();
                expect(workfile.isImage()).toBeFalsy();
            });
        });
    });

    describe("isSql", function() {
        it("returns true when the workfile is a sql file", function() {
            var workfile = rspecFixtures.workfile.sql();
            expect(workfile.isSql()).toBeTruthy();
        })

        it("returns false when the workfile is NOT a sql file", function() {
            var workfile = rspecFixtures.workfile.binary();
            expect(workfile.isSql()).toBeFalsy();
        })
    });

    describe("isAlpine", function() {
        it("returns true when the workfile is a afm file", function() {
            var workfile = rspecFixtures.workfile.binary({ fileType: "alpine" });
            expect(workfile.isAlpine()).toBeTruthy();
        })

        it("returns false when the workfile is NOT an afm file", function() {
            var workfile = rspecFixtures.workfile.sql();
            expect(workfile.isAlpine()).toBeFalsy();
        })
    });

    describe("isBinary", function() {
        it("returns true when the workfile is a binary file", function() {
            var workfile = rspecFixtures.workfile.binary();
            expect(workfile.isBinary()).toBeTruthy();
        })

        it("returns false when the workfile is NOT a binary file", function() {
            var workfile = rspecFixtures.workfile.sql();
            expect(workfile.isBinary()).toBeFalsy();
        })
    });

    describe("#extension", function() {
        it("returns the extension from the file's name", function() {
            var workfile = rspecFixtures.workfile.sql();
            expect(workfile.extension()).toBe("sql");

            workfile.set({ fileName: "foo.cpp" });
            expect(workfile.extension()).toBe("cpp");

            workfile.set({ fileName: "foo.js.coffee.erb" });
            expect(workfile.extension()).toBe("erb");

            workfile.set({ fileName: "FOO.CPP" });
            expect(workfile.extension()).toBe("cpp");

            workfile.set({ fileName: "foo" });
            expect(workfile.extension()).toBeNull();

            workfile.unset("fileName");
            expect(workfile.extension()).toBeUndefined();
        });
    });

    describe("createDraft", function() {
        beforeEach(function() {
            this.workfile = rspecFixtures.workfile.sql();
        });

        it("sets the required attributes", function() {
            var draft = this.workfile.createDraft();
            expect(draft.get("workfileId")).toBe(this.workfile.get('id'));
            expect(draft.get("workspaceId")).toBe(this.workfile.workspace().id);

            // backend expects content to be a first level property when saving, but it returns content nested elsewhere
            expect(draft.get("content")).toBe(this.workfile.content());
        });

        describe("when the draft is saved", function() {
            beforeEach(function() {
                var draft = this.workfile.createDraft();
                spyOnEvent(this.workfile, "change")
                draft.trigger("saved");
            });

            it("sets the workfile's 'hasDraft' field to true", function() {
                expect(this.workfile.get("hasDraft")).toBeTruthy();
            });

            it("sets the isDraft property on the workfile", function() {
                expect(this.workfile.isDraft).toBeTruthy();
            })

            it("does not trigger change on the workfile", function() {
                expect("change").not.toHaveBeenTriggeredOn(this.workfile);
            })
        });
    });

    describe("#allVersions", function() {
        it("sets the required attributes", function() {
            var workfileVersionSet = this.model.allVersions();
            expect(workfileVersionSet).toBeA(chorus.collections.WorkfileVersionSet);
            expect(workfileVersionSet.attributes.workspaceId).toBe(this.model.workspace().id);
            expect(workfileVersionSet.attributes.workfileId).toBe(this.model.get("id"));
        });
    });

    describe("canEdit", function() {
        beforeEach(function() {
            spyOn(this.model.workspace(), 'isActive').andReturn(true);
        });

        it("returns false when its version is not the current version", function() {
            this.model.set({latestVersionNum: 6});
            this.model.get('versionInfo').versionNum = 3
            expect(this.model.canEdit()).toBeFalsy();
        });

        it("returns true when its version is the current version", function() {
            this.model.set({latestVersionNum: 6});
            this.model.get('versionInfo').versionNum = 6
            expect(this.model.canEdit()).toBeTruthy();
        });

        it("returns false when its workspace is archived", function() {
            this.model.workspace().isActive.andReturn(false);
            this.model.set({latestVersionNum: 6});
            this.model.get('versionInfo').versionNum = 6
            expect(this.model.canEdit()).toBeFalsy();
        });
    });

    describe("isText", function() {
        it("returns true for plain text files", function() {
            var workfile = rspecFixtures.workfile.text();
            expect(workfile.isText()).toBeTruthy();
        });

        it("returns true for sql files", function() {
            var workfile = rspecFixtures.workfile.sql();
            expect(workfile.isText()).toBeTruthy();
        });

        it("returns false for image files", function() {
            var workfile = rspecFixtures.workfile.image();
            expect(workfile.isText()).toBeFalsy();
        });
    });

    describe("initializing from a WorkfileVersionSet", function() {
        beforeEach(function() {
            this.collection = new chorus.collections.WorkfileVersionSet([], {workspaceId: 1, workfileId: 2});
        });

        it("sets the workspaceId attribute on the model", function() {
            this.collection.add({versionInfo: {versionNum: 5}});

            expect(this.collection.models[0]).toBeA(chorus.models.Workfile);
            expect(this.collection.models[0].workspace().id).toBe(this.collection.attributes.workspaceId);
        });
    });

    describe("#fetch", function() {
        context("when the versionNum equals the latestVersionNum", function() {
            beforeEach(function() {
                this.model.get('versionInfo').versionNum = 99
                this.model.set({ latestVersionNum: 99 });
                this.model.fetch();
            })

            it("fetches the correct url", function() {
                expect(this.server.lastFetch().url).toBe("/workfiles/10020")
            })
        })

        context("when the versionNum is not equal to the latestVersionNum", function() {
            beforeEach(function() {
                this.model.get('versionInfo').versionNum = 88;
                this.model.get('versionInfo').id = 123;
                this.model.set({ latestVersionNum: 99 });
                this.model.fetch();
            })

            it("fetches the correct url", function() {
                expect(this.server.lastFetch().url).toBe("/workfiles/10020/versions/123")
            })
        })
    })

    describe("#save", function() {
        beforeEach(function() {
            spyOn(this.model.workspace(), 'isActive').andReturn(true);
        });

        context("with an old version", function() {
            beforeEach(function() {
                this.model.get('versionInfo').versionNum = 88
                this.model.set({ latestVersionNum: 99 });
                this.model.save();
            })

            it("does not save", function() {
                expect(this.server.lastUpdate()).toBeUndefined();
            })
        })

        context("with the latest version", function() {
            beforeEach(function() {
                this.model.get('versionInfo').versionNum = 99
                this.model.get('versionInfo').id = 213
                this.model.get('versionInfo').lastUpdatedStamp = "THEVERSIONSTAMP"
                this.model.set({ latestVersionNum: 99, lastUpdatedStamp: "THEWORKFILESTAMP"});
            })

            context("replacing the current version", function() {
                beforeEach(function() {
                    this.model.save();
                })

                it("saves to the correct url", function() {
                    expect(this.server.lastUpdate().url).toBe("/workfiles/10020/versions/213")
                });

                it("saves with the versionInfo lastUpdatedStamp", function() {
                    expect(this.server.lastUpdate().requestBody).toContain("THEVERSIONSTAMP");
                    expect(this.server.lastUpdate().requestBody).not.toContain("THEWORKFILESTAMP");
                });
            })

            context("saving as a new version", function() {
                beforeEach(function() {
                    this.model.saveAsNewVersion();
                })

                it("saves to the correct url", function() {
                    expect(this.server.lastCreate().url).toBe("/workfiles/10020/versions")
                })
            })
        })
    })

    describe("#content", function() {
        context("with an argument", function() {
            beforeEach(function() {
                spyOnEvent(this.model, "change");
                this.model.content("i am not old content")
            });

            it("sets the content", function() {
                expect(this.model.get("versionInfo").content).toBe('i am not old content');
            })

            it("triggers change", function() {
                expect("change").toHaveBeenTriggeredOn(this.model);
            });
            it("sets the content in the model", function() {
                expect(this.model.get("content")).toBe('i am not old content');
            })
        });

        context("with silent: true", function() {
            beforeEach(function() {
                spyOnEvent(this.model, "change");
                this.model.content("i am not old content", {silent: true})
            });

            it("sets the content", function() {
                expect(this.model.get("versionInfo").content).toBe('i am not old content');
            })

            it("does not trigger change", function() {
                expect("change").not.toHaveBeenTriggeredOn(this.model);
            });
            it("sets the content in the model", function() {
                expect(this.model.get("content")).toBe('i am not old content');
            })
        });

        context("without an argument", function() {
            it("returns the content", function() {
                expect(this.model.content()).toBe(this.model.get('versionInfo').content);
            })
        })
    })

    describe("#hasOwnPage", function() {
        it("returns true", function() {
            expect(this.model.hasOwnPage()).toBeTruthy();
        })
    })

    describe("#iconUrl", function() {
        context("when the workfile is an image", function() {
            it("returns the url of the image thumbnail", function() {
                var workfile = rspecFixtures.workfile.image({
                    versionInfo: { iconUrl: "some/file" }
                });

                expect(workfile.iconUrl()).toBe("some/file");
                expect(workfile.iconUrl({ size: "medium" })).toBe("some/file");
            });
        });

        context("when the workfile is not an image", function() {
            it("proxies to fileIconUrl helper", function() {
                var workfile = rspecFixtures.workfile.text({ fileName: "foo.cpp" });
                expect(workfile.iconUrl()).toBe(chorus.urlHelpers.fileIconUrl('cpp', 'large'));
                expect(workfile.iconUrl({ size: "medium" })).toBe(chorus.urlHelpers.fileIconUrl('cpp', 'medium'));

                var workfile = rspecFixtures.workfile.text({ fileName: "foo.java" });
                expect(workfile.iconUrl()).toBe(chorus.urlHelpers.fileIconUrl('java', 'large'));
                expect(workfile.iconUrl({ size: "medium" })).toBe(chorus.urlHelpers.fileIconUrl('java', 'medium'));
            })
        });
    });
});
