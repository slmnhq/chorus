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
      @hash.should have_key(:id)
      @hash.should have_key(:name)
      @hash.should have_key(:timestamp)
      @hash.should have_key(:entity_type)
      @hash.should have_key(:type)
    end
  end
end
