require "spec_helper"

describe WorkfileName do
  describe ".resolve_name_for" do
    let(:workspace) {FactoryGirl.create :workspace }
    let(:user) {FactoryGirl.create :user }


    context "no previous workfile" do
      it "does not change the name of the file" do
        workfile = Workfile.new(:file_name => "test.sql")
        WorkfileName.resolve_name_for!(workfile)
        workfile.file_name.should == "test.sql"
      end

    end


    context "previous workfiles" do

      before do

        workfile = Workfile.new(:file_name => "test.sql")
        workfile.workspace = workspace
        workfile.owner = user
        workfile.save

      end

      it "changes the name of the workfile" do

        workfile= Workfile.new(:file_name => "test.sql")
        workfile.workspace = workspace
        WorkfileName.resolve_name_for!(workfile)
        workfile.file_name.should == "test_1.sql"
      end

    end

    context "workfiles with same name in different workspace" do

      before do

        workfile = Workfile.new(:file_name => "test.sql")
        workfile.workspace = workspace
        workfile.owner = user
        workfile.save

      end

      it "does not change the name of the file" do
        workspace1 = FactoryGirl.create :workspace
        workfile = Workfile.new(:file_name => "test.sql")
        workfile.workspace = workspace1
        WorkfileName.resolve_name_for!(workfile)
        workfile.file_name.should == "test.sql"
      end
    end
  end
end