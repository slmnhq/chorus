require 'spec_helper'

resource "Workfiles" do
  let!(:owner) { FactoryGirl.create :user }
  let!(:workfile) { FactoryGirl.create(:workfile, :owner => owner) }
  let(:file) { test_file("workfile.sql", "text/sql") }
  let!(:workfile_version) { FactoryGirl.create(:workfile_version, :workfile => workfile, :contents => file, :owner => owner) }
  let(:id) { workfile.to_param }

  before do
    log_in owner
  end

  get "/workfiles/:id" do
    example_request "Show workfile details" do
      status.should == 200
    end
  end
end
