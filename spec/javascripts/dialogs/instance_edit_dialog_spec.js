describe("InstanceEditDialog", function() {
    beforeEach(function() {
        this.launchElement = $("<button/>");
        this.instance = fixtures.instance({name : "pasta", host : "greenplum", port : "8555", description : "it is a food name"});
        this.dialog = new chorus.dialogs.InstancesEdit({launchElement : this.launchElement, pageModel : this.instance });
    });

    describe("#render", function() {
        describe("when the instance is a registered instance", function() {
            beforeEach(function() {
                this.dialog.model.set({ provisionType : "register"})
                this.dialog.render();
            });

            it("Field called 'Names' should be editable and pre populated", function() {
                expect(this.dialog.$("input[name=name]").val()).toBe("pasta");
                expect(this.dialog.$("input[name=name]").attr("disabled")).toBeFalsy();
            })

            it("Field called 'description' should be editable and pre populated", function() {
                expect(this.dialog.$("textarea[name=description]").val()).toBe("it is a food name");
                expect(this.dialog.$("textarea[name=description]").attr("disabled")).toBeFalsy();
            })

            it("Field called 'host' should be editable and pre populated", function() {
                expect(this.dialog.$("input[name=host]").val()).toBe("greenplum");
                expect(this.dialog.$("input[name=host]").attr("disabled")).toBeFalsy();
            })

            it("Field called 'port' should be editable and pre populated", function() {
                expect(this.dialog.$("input[name=port]").val()).toBe("8555");
                expect(this.dialog.$("input[name=port]").attr("disabled")).toBeFalsy();
            });
        });

        describe("when the instance is a provisioned instance", function() {
            beforeEach(function() {
                this.dialog.model.set({ provisionType : "create" , size: "10"})
                this.dialog.render();
            });

            it("Field called 'Names' should be editable and pre populated", function() {
                expect(this.dialog.$("input[name=name]").val()).toBe("pasta");
                expect(this.dialog.$("input[name=name]").attr("disabled")).toBeFalsy();
            })

            it("Field called 'description' should be editable and pre populated", function() {
                expect(this.dialog.$("textarea[name=description]").val()).toBe("it is a food name");
                expect(this.dialog.$("textarea[name=description]").attr("disabled")).toBeFalsy();
            })

            it("Field called 'host' should not be editable and pre populated", function() {
                expect(this.dialog.$("input[name=host]").val()).toBe("greenplum");
                expect(this.dialog.$("input[name=host]").attr("disabled")).toBeTruthy();
            })

            it("Field called 'port' should not be editable and pre populated", function() {
                expect(this.dialog.$("input[name=port]").val()).toBe("8555");
                expect(this.dialog.$("input[name=port]").attr("disabled")).toBeTruthy();
            })

            it("Field called 'size' should not be editable and pre populated", function() {
                expect(this.dialog.$("input[name=size]").val()).toBe("10");
                expect(this.dialog.$("input[name=size]").attr("disabled")).toBeTruthy();
            })
        });

        describe("change owner dropdown", function() {
            beforeEach(function() {
                this.dialog.model.set({ provisionType : "register"});
                this.user1 = new chorus.models.User({ id: '1', userName: "niels", firstName: "ni", lastName: "slew"});
                this.user2 = new chorus.models.User({ id: '2', userName: "ludwig", firstName: "lu", lastName: "wig" });
                this.user3 = new chorus.models.User({ id: '3', userName: "isaac", firstName: "is", lastName: "ac" });
                this.dialog.userSet.add([ this.user1, this.user2, this.user3 ]);
                this.dialog.render();
            });

            it("shows the change owner dropdown", function() {
                expect(this.dialog.$("select[name=owner] option").length).toBe(3);
            });

            it("shows the change owner name in the dropdown", function() {
                expect(this.dialog.$("select[name=owner] option").eq(0).text()).toBe("ni slew");
            });
        });

    });

    describe("saving", function() {
        beforeEach(function() {
            this.dialog.model.set({ provisionType : "register"});
            spyOn(this.dialog.model, "save");
            spyOn(this.dialog, "closeModal");
            spyOn(chorus, "toast");
            this.dialog.render();
            this.dialog.$("button[type=submit]").submit();
        });

        it("should call the save method", function() {
            expect(this.dialog.model.save).toHaveBeenCalled();
        });

        it("puts the button in 'loading' mode", function() {
            expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
        });

        it("changes the text on the upload button to 'saving'", function() {
            expect(this.dialog.$("button.submit").text()).toMatchTranslation("instances.new_dialog.saving");
        });

        it("disables the cancel button", function() {
            expect(this.dialog.$("button.cancel").attr("disabled")).toBe("disabled");
        });

        context("when save completes", function() {
            beforeEach(function() {
                this.dialog.model.trigger("saved");
            });

            it("displays toast message", function() {
                expect(chorus.toast).toHaveBeenCalled();
            });

            it("closes the dialog", function() {
                expect(this.dialog.closeModal).toHaveBeenCalled();
            });
        });

        context("when the upload gives a server error", function() {
            beforeEach(function() {
                this.dialog.model.set({serverErrors : [
                    { message: "foo" }
                ]});
                this.dialog.model.trigger("saveFailed");
            });

            it("display the correct error", function() {
                expect(this.dialog.$(".errors").text()).toContain("foo");
            });

            itRecoversFromError();
        });

        context("when the validation fails", function() {
            beforeEach(function() {
                this.dialog.model.trigger("validationFailed");
            });

            itRecoversFromError();
        });

        function itRecoversFromError() {
            it("takes the button out of 'loading' mode", function() {
                expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
            });

            it("sets the button text back to 'Uploading'", function() {
                expect(this.dialog.$("button.submit").text()).toMatchTranslation("instances.edit_dialog.save");
            });
        }
    });
});