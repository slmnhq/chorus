require 'spec_helper'

describe WorkfilePresenter, :type => :view do
  let(:user) { users(:owner) }
  let(:workfile) { workfiles(:private) }
  let(:workspace) { workfile.workspace }
  let(:presenter) { WorkfilePresenter.new(workfile, view) }

  before(:each) do
    stub(ActiveRecord::Base).current_user { user }
  end

  describe "#to_hash" do
    let(:hash) { presenter.to_hash }

    it "includes the right keys" do
      hash.should have_key(:workspace)
      hash.should have_key(:owner)

      hash.should have_key(:file_name)
      hash.should have_key(:file_type)
      hash.should have_key(:latest_version_id)
      hash.should have_key(:has_draft)
      hash.should have_key(:is_deleted)
      hash.should_not have_key(:execution_schema)
    end

    it "uses the workspace presenter to serialize the workspace" do
      hash[:workspace].to_hash.should == (WorkspacePresenter.new(workspace, view).to_hash)
    end

    it "uses the user presenter to serialize the owner" do
      hash[:owner].to_hash.should == (UserPresenter.new(user, view).to_hash)
    end

    it "uses the workfile file name" do
      hash[:file_name].should == workfile.file_name
    end

    context "workfile has a draft for that user" do
      it "has_draft value is true" do
        FactoryGirl.create(:workfile_draft, :workfile_id => workfile.id, :owner_id => user.id)
        hash = presenter.to_hash
        hash[:has_draft].should == true
      end
    end

    context "No workfile draft for that user" do
      it "has_draft value is false" do
        hash[:has_draft].should == false
      end
    end

    context ":include_execution_schema is passed as an option" do
      let(:presenter) { WorkfilePresenter.new(workfile, view, :include_execution_schema => true) }

      it "includes the execution_schema" do
        hash[:execution_schema].should == GpdbSchemaPresenter.new(workfile.execution_schema, view).to_hash
      end
    end

    it "sanitizes file name" do
      bad_value = 'file_ending_in_invalid_quote"'
      workfile = FactoryGirl.create(:workfile)
      workfile_version = FactoryGirl.create(:workfile_version, :contents => test_file(bad_value), :workfile => workfile)
      json = WorkfilePresenter.new(workfile, view).to_hash

      json[:file_name].should_not include '"'
    end
  end
end
