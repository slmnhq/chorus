require 'spec_helper'

resource "Hadoop DB instances" do
  let(:owner) { users(:owner) }
  let!(:instance) { FactoryGirl.create(:hadoop_instance, :owner => owner, :host => 'will_be_stubbed', :port => '8020', :username => 'pivotal', :group_list => 'pivotal') }
  let!(:dir_entry) { HdfsEntry.create!({:path => '/files', :modified_at => Time.now.to_s, :is_directory => "true", :content_count => "3", :hadoop_instance => instance}, :without_protection => true) }
  let!(:file_entry) { HdfsEntry.create!({:path => '/test.txt', :modified_at => Time.now.to_s, :size => "1234kB", :hadoop_instance => instance}, :without_protection => true ) }
  let!(:event) { FactoryGirl.create(:hadoop_instance_created_event, :hadoop_instance => instance) }
  let!(:activity) { Activity.create!(:entity => instance, :event => event) }
  let(:hadoop_instance_id) { instance.to_param }

  before do
    log_in owner
    stub(Gpdb::ConnectionChecker).check! { true }
    stub(Hdfs::QueryService).instance_version(anything) { "1.0.0" }

    service = Object.new
    stub(Hdfs::QueryService).new(instance.host, instance.port, instance.username, instance.version) { service }
    stub(service).show('/test.txt') { ["This is such a nice file.", "It's my favourite file.", "I could read this file all day.'"] }
    stub(HdfsEntry).list('/', instance) { [dir_entry, file_entry] }
    stub(HdfsEntry).list('/files/', instance) { [file_entry] }
    stub(HdfsEntry).list('/test.txt', instance) { [file_entry] }
  end

  post "/hadoop_instances" do
    parameter :name, "Instance alias"
    parameter :description, "Description"
    parameter :host, "Host IP or address"
    parameter :port, "Port"
    parameter :username, "Username for connection"
    parameter :group_list, "Group list for connection"

    let(:name) { "Sesame_Street" }
    let(:description) { "Can you tell me how to get..." }
    let(:host) { "sesame.street.local" }
    let(:port) { "8020" }
    let(:username) { "big" }
    let(:group_list) { "bird" }

    required_parameters :name, :host, :port, :username, :group_list
    scope_parameters :hadoop_instance, :all

    example_request "Register a Hadoop database" do
      status.should == 201
    end
  end

  put "/hadoop_instances/:id" do
    parameter :name, "Instance alias"
    parameter :description, "Description"
    parameter :host, "Host IP or address"
    parameter :port, "Port"
    parameter :username, "Username for connection"
    parameter :group_list, "Group list for connection"

    let(:name) { "22 Duck Street" }
    let(:description) { "Quack!" }
    let(:host) { "duck.heroku.com" }
    let(:port) { "8121" }
    let(:username) { "donaldd" }
    let(:group_list) { "scroogemcduck" }
    let(:id) { instance.id }

    required_parameters :name, :host, :port, :username, :group_list
    scope_parameters :hadoop_instance, :all

    example_request "Update the details on a hadoop instance" do
      status.should == 200
    end
  end

  get "/hadoop_instances" do
    example_request "Get a list of registered Hadoop databases" do
      status.should == 200
    end
  end

  get "/hadoop_instances/:id" do
    let(:id) { instance.to_param }

    example_request "Show instance details"  do
      status.should == 200
    end
  end

  get "/hadoop_instances/:hadoop_instance_id/files" do
    example_request "Get a list of files for a specific hadoop instance's root directory"  do
      status.should == 200
    end
  end

  get "/hadoop_instances/:hadoop_instance_id/files/:id" do
    let(:id) { dir_entry.id }

    example_request "Get a list of files for a subdirectory of a specific hadoop instance"  do
      status.should == 200
    end
  end

  get "/hadoop_instances/:hadoop_instance_id/activities" do
    example_request "List activities for a hadoop instance"  do
      status.should == 200
    end
  end
end

 
