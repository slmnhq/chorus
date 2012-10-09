require 'spec_helper'

describe Attachment do
  describe "validations" do

    let(:max_attachment_size) { Chorus::Application.config.chorus['file_sizes_mb']['attachment'] }
    it { should belong_to :note }
    it { should validate_attachment_size(:contents).less_than(max_attachment_size.megabytes) }
  end

  describe "search fields" do
    it "indexes text fields" do
      Attachment.should have_searchable_field :name
    end
  end

  describe "security_type_name" do
    it "delegates to the note" do
      attachment = attachments(:attachment_workspace)
      attachment.security_type_name.should == attachment.note.security_type_name
    end
  end
end