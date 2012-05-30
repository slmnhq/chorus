require 'spec_helper'

describe Workfile do
  describe "validations" do
    context "file name with valid characters" do
      it "is valid" do
        workfile = Workfile.new :file_name => 'work_(-file).sql'

        workfile.should be_valid
      end
    end

    context "file name with question mark" do
      it "is not valid" do
        workfile = Workfile.new :file_name => 'workfile?.sql'


        workfile.should_not be_valid
        workfile.errors[:file_name].should_not be_empty
      end
    end
  end
end