require 'spec_helper'

describe HdfsFileReference do
  it "can have paths/filenames longer than 255 characters" do
    file = HdfsFileReference.new
    file.path = "/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/folder/file.txt"
    file.save!

    file.reload.path.length.should == 289
  end

end