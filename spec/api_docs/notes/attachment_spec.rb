require 'spec_helper'

resource "Notes" do
  let(:user) { users(:the_collaborator) }

  before do
    log_in user
  end

  get "/attachments/:attachment_id/download" do
    parameter :attachment_id, "Attachment id"
    required_parameters :attachment_id

    let(:attachment_id) { attachments(:sql).id }

    example_request "Download an attachment" do
      status.should == 200
    end
  end
end
