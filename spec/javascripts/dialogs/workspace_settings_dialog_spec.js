describe("WorkspaceSettings dialog", function() {
    beforeEach(function() {
        this.launchElement = $("<a></a>");
        this.workspace = new chorus.models.Workspace({name: "my name", summary: "my summary", id: "457"});
        this.workspace.set({ ownerId : '12' });
        this.members = this.workspace.members();
        this.members.add([
                         new chorus.models.User({ id: 11, firstName: "Mikey", lastName: "B" }),
                         new chorus.models.User({ id: 12, firstName: "Deborah", lastName: "D" }),
                         new chorus.models.User({ id: 13, firstName: "Richard", lastName: "G" })
        ]);

        this.dialog = new chorus.dialogs.WorkspaceSettings({launchElement : this.launchElement, pageModel : this.workspace });
        this.loadTemplate("workspace_settings");
        this.loadTemplate("image_upload");
    });

    describe("#setup", function() {
        it("fetches the workspace's members", function() {
            this.dialog = new chorus.dialogs.WorkspaceSettings({launchElement : this.launchElement, pageModel : this.workspace });
            expect(_.last(this.server.requests).url).toBe(this.workspace.members().url());
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
        });

        it("has the correct title", function() {
            expect(this.dialog.title).toMatchTranslation("workspace.settings.title");
        });

        it("has an input for workspace name", function() {
            expect(this.dialog.$("input[name=name]").val()).toBe(this.dialog.pageModel.get("name"))
        });

        it("has a text area for summary", function() {
            expect(this.dialog.$("textarea[name=summary]").val()).toBe(this.dialog.pageModel.get("summary"));
        });

        it("renders the archiving instructions", function() {
            expect(this.dialog.$(".archived_text").text().trim()).toMatchTranslation("workspace.settings.archived_description");
        });

        describe("the owner select", function() {
            it("shows up", function() {
                expect(this.dialog.$("select.owner")).toExist();
            });

            it("has an option for each member", function() {
                var options = this.dialog.$("select.owner option");
                expect(options.length).toBe(3);

                expect(options.eq(0).text()).toBe("Mikey B");
                expect(options.eq(1).text()).toBe("Deborah D");
                expect(options.eq(2).text()).toBe("Richard G");

                expect(options.eq(0).val()).toBe("11");
                expect(options.eq(1).val()).toBe("12");
                expect(options.eq(2).val()).toBe("13");
            });

            it("defaults to the current owner", function() {
                expect(this.dialog.$("select.owner").val()).toBe("12");
            });
        });

        context("when the workspace is public", function() {
            beforeEach(function() {
                this.workspace.set({ isPublic : true })
            })

            it("checks the 'Publicly available' checkbox", function() {
                expect(this.dialog.$("input[name=isPublic]")).toBeChecked();
            })
        })

        context("when the workspace is not public", function() {
            beforeEach(function() {
                this.workspace.set({ isPublic : false })
            })

            it("does not check the 'Publicly available' checkbox", function() {
                expect(this.dialog.$("input[name=isPublic]")).not.toBeChecked();
            })
        })

        context("when the user is the owner of the workspace", function() {
            beforeEach(function() {
                setLoggedInUser({ id : 10101 });
                this.workspace.set({ ownerId : 10101 })
            })

            it("does not disable the 'Publicly available' checkbox", function() {
                expect(this.dialog.$("input[name=isPublic]")).not.toBeDisabled();
            })

            context("and the workspace is not archived", function() {
                beforeEach(function() {
                    this.workspace.set({ active : true })
                })

                it("displays enabled radio buttons with 'active' selected", function() {
                    var activeRadio = this.dialog.$("input[type=radio][id=workspace_active]");
                    var archivedRadio = this.dialog.$("input[type=radio][id=workspace_archived]");
                    expect(activeRadio).not.toBeDisabled();
                    expect(activeRadio).toBeChecked();
                    expect(archivedRadio).not.toBeDisabled();
                    expect(archivedRadio).not.toBeChecked();
                })
            })

            context("and the workspace is archived", function() {
                beforeEach(function() {
                    this.workspace.set({ active : false })
                })

                it("displays enabled radio buttons with 'archived' selected", function() {
                    var activeRadio = this.dialog.$("input[type=radio][id=workspace_active]");
                    var archivedRadio = this.dialog.$("input[type=radio][id=workspace_archived]");
                    expect(activeRadio).not.toBeDisabled();
                    expect(activeRadio).not.toBeChecked();
                    expect(archivedRadio).not.toBeDisabled();
                    expect(archivedRadio).toBeChecked();
                })
            })
        })

        context("when the user is not the owner of the workspace", function() {
            beforeEach(function() {
                this.workspace.set({ ownerId : 10101 }, { silent : true })
            })

            context("and the user is not an admin", function() {
                beforeEach(function() {
                    setLoggedInUser({ id : 10102 });
                    this.dialog.render();
                })

                it("disables the 'Publicly available' checkbox", function() {
                    expect(this.dialog.$("input[name=isPublic]")).toBeDisabled();
                })

                context("and the workspace is not archived", function() {
                    beforeEach(function() {
                        this.workspace.set({ active : true })
                    })

                    it("displays disabled radio buttons with 'active' selected", function() {
                        var activeRadio = this.dialog.$("input[type=radio][id=workspace_active]");
                        var archivedRadio = this.dialog.$("input[type=radio][id=workspace_archived]");
                        expect(activeRadio).toBeDisabled();
                        expect(activeRadio).toBeChecked();
                        expect(archivedRadio).toBeDisabled();
                        expect(archivedRadio).not.toBeChecked();
                    })
                })

                context("and the workspace is archived", function() {
                    beforeEach(function() {
                        this.workspace.set({ active : false })
                    })

                    it("displays disabled radio buttons with 'archived' selected", function() {
                        var activeRadio = this.dialog.$("input[type=radio][id=workspace_active]");
                        var archivedRadio = this.dialog.$("input[type=radio][id=workspace_archived]");
                        expect(activeRadio).toBeDisabled();
                        expect(activeRadio).not.toBeChecked();
                        expect(archivedRadio).toBeDisabled();
                        expect(archivedRadio).toBeChecked();
                    })
                })
            });

            context("and the user is an admin", function() {
                beforeEach(function() {
                    setLoggedInUser({ id : 10102, admin : true });
                    this.dialog.render();
                })

                it("does not disable the 'Publicly available' checkbox", function() {
                    expect(this.dialog.$("input[name=isPublic]")).not.toBeDisabled();
                })

                context("and the workspace is not archived", function() {
                    beforeEach(function() {
                        this.workspace.set({ active : true })
                    })

                    it("displays enabled radio buttons with 'active' selected", function() {
                        var activeRadio = this.dialog.$("input[type=radio][id=workspace_active]");
                        var archivedRadio = this.dialog.$("input[type=radio][id=workspace_archived]");
                        expect(activeRadio).not.toBeDisabled();
                        expect(activeRadio).toBeChecked();
                        expect(archivedRadio).not.toBeDisabled();
                        expect(archivedRadio).not.toBeChecked();
                    })
                })

                context("and the workspace is archived", function() {
                    beforeEach(function() {
                        this.workspace.set({ active : false })
                    })

                    it("displays enabled radio buttons with 'archived' selected", function() {
                        var activeRadio = this.dialog.$("input[type=radio][id=workspace_active]");
                        var archivedRadio = this.dialog.$("input[type=radio][id=workspace_archived]");
                        expect(activeRadio).not.toBeDisabled();
                        expect(activeRadio).not.toBeChecked();
                        expect(archivedRadio).not.toBeDisabled();
                        expect(archivedRadio).toBeChecked();
                    })
                })
            });
        })

        context("when the workspace has an image", function() {
            beforeEach(function() {
                spyOn(this.workspace, 'hasImage').andReturn(true);
                this.dialog.render();
            });

            it("displays the workspace image", function() {
                var image = this.dialog.$("img");
                expect(image.attr("src")).toContain(this.workspace.imageUrl());
            });

            it("displays the 'change image' link", function() {
                expect(this.dialog.$(".edit_photo a.action")).toExist();
                expect(this.dialog.$(".edit_photo a.action").text().trim()).toMatchTranslation('workspace.settings.image.change');
            });
        });

        context("when the workspace has no image", function() {
            beforeEach(function() {
                spyOn(this.workspace, 'hasImage').andReturn(false);
                this.dialog.render();
            });

            it("does not display an image", function() {
                // expect(this.dialog.$("img")).not.toExist();
            });

            it("displays the 'add image' link", function() {
                expect(this.dialog.$(".edit_photo a.action")).toExist();
                expect(this.dialog.$(".edit_photo a.action").text().trim()).toMatchTranslation('workspace.settings.image.add');
            });
        });

        context("submitting the form with valid data", function() {
            beforeEach(function() {
                spyOnEvent($(document), "close.facebox");
                spyOn(this.dialog.pageModel, "save").andCallThrough();
                this.dialog.$("input[name=name]").val("my modified name");
                this.dialog.$("textarea[name=summary]").val("my modified summary");
                this.dialog.$("select.owner").val('13');
                this.dialog.$('form').submit();
            })

            it("saves the workspace", function() {
                expect(this.dialog.pageModel.save).toHaveBeenCalled();
            });

            it("sets the name on the workspace", function() {
                expect(this.dialog.pageModel.get("name")).toBe("my modified name");
            });

            it("sets the name on the workspace", function() {
                expect(this.dialog.pageModel.get("summary")).toBe("my modified summary");
            });

            it("sets the owner id on the workspace", function() {
                expect(this.dialog.pageModel.get("ownerId")).toBe("13");
            });

            it("does not close the dialog before the server responds", function() {
                expect("close.facebox").not.toHaveBeenTriggeredOn($(document));
            });

            context("when the isPublic checkbox is checked", function() {
                beforeEach(function() {
                    this.dialog.$("input[name=isPublic]").attr("checked", "checked");
                    this.dialog.$('form').submit();
                })

                it("sets the isPublic model attribute to true", function() {
                    expect(this.dialog.pageModel.get("isPublic")).toBe(true);
                })
            })

            context("when the isPublic checkbox is not checked", function() {
                beforeEach(function() {
                    this.dialog.$("input[name=isPublic]").removeAttr("checked");
                    this.dialog.$('form').submit();
                })

                it("sets the isPublic model attribute to false", function() {
                    expect(this.dialog.pageModel.get("isPublic")).toBe(false);
                })
            })

            context("when the active radio is checked", function() {
                beforeEach(function() {
                    this.dialog.$("input#workspace_active").attr("checked", "checked");
                    this.dialog.$('form').submit();
                })

                it("sets the active model attribute to true", function() {
                    expect(this.dialog.pageModel.get("active")).toBe(true);
                })

                it("sets the archived model attribute to false", function() {
                    expect(this.dialog.pageModel.get("archived")).toBe(false);
                })
            })

            context("when the archived radio is checked", function() {
                beforeEach(function() {
                    this.dialog.$("input#workspace_archived").attr("checked", "checked");
                    this.dialog.$('form').submit();
                })

                it("sets the active model attribute to false", function() {
                    expect(this.dialog.pageModel.get("active")).toBe(false);
                })

                it("sets the archived model attribute to true", function() {
                    expect(this.dialog.pageModel.get("archived")).toBe(true);
                })
            })

            context("the server responds with success", function() {
                beforeEach(function() {
                    this.server.respondWith([200, {'Content-Type': 'text/plain'}, '{"resource":[{"id":"9"}], "status": "ok"}']);
                    this.server.respond();
                });

                it("closes the dialog", function() {
                    expect("close.facebox").toHaveBeenTriggeredOn($(document));
                });
            });

            context("the server responds with failure", function() {
                beforeEach(function() {
                    this.server.respondWith([200, {"Content-Type": "text/plain"}, '{"status": "fail", "message" : [{"message": "fake error message"}]}']);
                    this.server.respond();
                });

                it("does not close the dialog", function() {
                    expect("close.facebox").not.toHaveBeenTriggeredOn($(document));
                });

                it("displays the errors", function() {
                    expect(this.dialog.$(".errors").text()).toContain("fake error");
                });

                it("does not clear the form", function() {
                    expect(this.dialog.$("input[name=name]").val()).toBe("my modified name");
                });
            });
        });

        context("submitting the form with invalid data", function() {
            beforeEach(function() {
                this.validatedSpy = jasmine.createSpy("validated");
                this.dialog.pageModel.bind("validated", this.validatedSpy);
                this.validationFailedSpy = jasmine.createSpy("validationFailed");
                this.dialog.pageModel.bind("validationFailed", this.validationFailedSpy);
                this.dialog.$("input[name=name]").val("");
                this.dialog.$("textarea[name=summary]").val("my modified summary");
                this.dialog.$('form').submit();
            });

            it("triggers validation Failed", function() {
                expect(this.validationFailedSpy).toHaveBeenCalled();
            })

            it("does not set the name on the workspace", function() {
                expect(this.dialog.pageModel.get("name")).toBe("my name");
            });

            it("does not set the name on the workspace", function() {
                expect(this.dialog.pageModel.get("summary")).toBe("my summary");
            })
        })
    })
})
