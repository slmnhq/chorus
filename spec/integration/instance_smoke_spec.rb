require File.join(File.dirname(__FILE__), 'spec_helper')

describe " add a gpdb instance " do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "creates an instance" do
    new_instance_name = "GPDB_inst_sel_test#{Time.now.to_i}"
    create_gpdb_instance(:name => new_instance_name)
    verify_instance_name(new_instance_name)
  end
end

describe "adding a hadoop instance" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "creates a hadoop instance" do
    new_instance_name = "Hadoop_inst_sel_test#{Time.now.to_i}"
    create_valid_hadoop_instance(:name => new_instance_name)
    verify_instance_name(new_instance_name)
  end
end
