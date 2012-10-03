require 'spec_helper'

resource "Workfile drafts" do
  let(:owner) { workspace.owner }
  let!(:workspace) { workfile.workspace }
  let!(:workfile) { workfiles("sql.sql") }
  let!(:file) { test_file("workfile.sql", "text/sql") }
  let!(:workfile_version) { workfile_versions(:public)}
  let!(:workfile_id) { workfile.to_param }

  before do
    log_in owner
  end

  get "/workfiles/:workfile_id/draft" do
    before do
      workfile_drafts(:default).tap { |d| d.workfile = workfile; d.save! }
    end

    parameter :workfile_id, "ID of the workfile for which the draft should be shown"

    required_parameters :workfile_id

    example_request "Show workfile draft" do
      status.should == 200
    end
  end

  put "/workfiles/:workfile_id/draft" do
    before do
      workfile_drafts(:default).tap { |d| d.workfile = workfile; d.save! }
    end
    let(:content) { "This is the updated content." }

    parameter :workfile_id, "ID of the workfile for which the draft should be updated"
    parameter :content, "Content"

    required_parameters :workfile_id, :content

    example_request "Updates the workfile draft" do
      status.should == 200
      response_body.should include(content)
    end
  end

  post "/workfiles/:workfile_id/draft" do
    let(:content) { "This is content." }

    parameter :workfile_id, "ID of the workfile for which the draft should be created"
    parameter :content, "Content"

    required_parameters :workfile_id, :content

    example_request "Creates the draft for a workfile" do
      status.should == 201
      response_body.should include(content)
    end
  end

  delete "/workfiles/:workfile_id/draft" do
    before do
      workfile_drafts(:default).tap { |d| d.workfile = workfile; d.save! }
    end

    parameter :workfile_id, "ID of the workfile for which the draft should be deleted"

    required_parameters :workfile_id

    example_request "Delete workfile draft" do
      status.should == 200
    end
  end
end
