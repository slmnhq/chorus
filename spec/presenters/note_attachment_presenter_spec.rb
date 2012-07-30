require 'spec_helper'

describe NoteAttachmentPresenter, :type => :view do

  before(:each) do
    @note_attachment = NoteAttachment.first
    @presenter = NoteAttachmentPresenter.new(@note_attachment, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the right keys" do
      @hash.should have_key(:file_name)
    end
  end
end
