require 'spec_helper'

resource "Workfiles" do
  let!(:owner) { FactoryGirl.create :user }
  let!(:workspace) { FactoryGirl.create(:workspace, :owner => owner) }
  let!(:workfile) { FactoryGirl.create(:workfile, :owner => owner, :workspace => workspace) }
  let!(:file) { test_file("workfile.sql", "text/sql") }
  let!(:workfile_version) { FactoryGirl.create(:workfile_version, :workfile => workfile, :contents => file, :owner => owner) }
  let!(:workfile_id) { workfile.to_param }

  before do
    log_in owner
  end

  get "/workfiles/:id" do
    let(:id) { workfile.to_param }

    example_request "Show workfile details" do
      status.should == 200
    end
  end

  # TODO: the workfileversion controller update action seems buggy, wait til fixed

  # put "/workfiles/:workfile_id/versions/:id" do
  #   let!(:id) { workfile_version.to_param }

  #   parameter :owner_id, "Workfile owner"
  #   parameter :commit_message, "Commit message"
  #   parameter :modifier_id, "Workfile modifier"
  #   parameter :content, "Content of the file"

  #   required_parameters :owner_id
  #   scope_parameters :workfile, :all

  #   let(:owner_id) { owner.to_param }
  #   let(:commit_message) { "Hey there, Billy" }
  #   let(:modifier_id) { owner.to_param }
  #   let(:content) { workfile_version.contents }

  #   example_request "Update workfile version" do
  #     status.should == 200
  #   end
  # end

  post "/workfiles/:workfile_id/versions" do
    parameter :owner_id, "Workfile owner"
    parameter :commit_message, "Commit message"
    parameter :modifier_id, "Workfile modifier"
    parameter :content, "Content of the file"

    required_parameters :owner_id
    scope_parameters :workfile, :all

    let(:owner_id) { owner.to_param }
    let(:commit_message) { "Get off my lawn, you darn kids!" }
    let(:modifier_id) { owner.to_param }
    let(:content) { workfile_version.contents }

    example_request "Create a workfile version" do
      status.should == 200
    end
  end
end
