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

            it("Field called 'Names' should be editable and pre populated" ,function(){
                expect(this.dialog.$("input[name=name]").val()).toBe("pasta");
                expect(this.dialog.$("input[name=name]").attr("disabled")).toBeFalsy();
            })

            it("Field called 'description' should be editable and pre populated" ,function(){
                expect(this.dialog.$("textarea[name=description]").val()).toBe("it is a food name");
                expect(this.dialog.$("textarea[name=description]").attr("disabled")).toBeFalsy();
            })

            it("Field called 'host' should be editable and pre populated" ,function(){
                expect(this.dialog.$("input[name=host]").val()).toBe("greenplum");
                expect(this.dialog.$("input[name=host]").attr("disabled")).toBeFalsy();
            })

            it("Field called 'port' should be editable and pre populated" ,function(){
                expect(this.dialog.$("input[name=port]").val()).toBe("8555");
                expect(this.dialog.$("input[name=port]").attr("disabled")).toBeFalsy();
            })
        });

        describe("when the instance is a provisioned instance", function() {
            beforeEach(function() {
                this.dialog.model.set({ provisionType : "create" , size: "10"})
                this.dialog.render();
            });

            it("Field called 'Names' should be editable and pre populated" ,function(){
                expect(this.dialog.$("input[name=name]").val()).toBe("pasta");
                expect(this.dialog.$("input[name=name]").attr("disabled")).toBeFalsy();
            })

            it("Field called 'description' should be editable and pre populated" ,function(){
                expect(this.dialog.$("textarea[name=description]").val()).toBe("it is a food name");
                expect(this.dialog.$("textarea[name=description]").attr("disabled")).toBeFalsy();
            })

            it("Field called 'host' should not be editable and pre populated" ,function(){
                expect(this.dialog.$("input[name=host]").val()).toBe("greenplum");
                expect(this.dialog.$("input[name=host]").attr("disabled")).toBeTruthy();
            })

            it("Field called 'port' should not be editable and pre populated" ,function(){
                expect(this.dialog.$("input[name=port]").val()).toBe("8555");
                expect(this.dialog.$("input[name=port]").attr("disabled")).toBeTruthy();
            })

            it("Field called 'size' should not be editable and pre populated" ,function(){
                expect(this.dialog.$("input[name=size]").val()).toBe("10");
                expect(this.dialog.$("input[name=size]").attr("disabled")).toBeTruthy();
            })
        });
    });

    describe("saving", function() {
        describe("when the instance is a registered instance", function() {
            beforeEach(function() {
                this.dialog.model.set({ provisionType : "register"});
                spyOn(this.dialog.model, "save");
                spyOn(this.dialog, "closeModal");
                this.dialog.render();
                this.dialog.$("button[type=submit]").submit();
            });

            it("should call the save method", function() {
                expect(this.dialog.model.save).toHaveBeenCalled();
            });

            it("should close the dialog box", function() {
                this.dialog.model.trigger("saved");
                expect(this.dialog.closeModal).toHaveBeenCalled();
            });
        });
    });


});