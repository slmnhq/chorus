shared_examples "sanitized presenter" do |factory_name, field_to_sanitize, presented_field = field_to_sanitize|
  it "sanitizes #{field_to_sanitize}" do
    bad_value = "<script>alert('got your cookie')</script>"

    presented = FactoryGirl.build factory_name, field_to_sanitize => bad_value
    json = described_class.new(presented, view).to_hash

    json[presented_field].should_not match "<"
  end
end

shared_examples "dataset presenter" do |dataset_factory_name|
  before do
    gpdb_instance = FactoryGirl.build(:gpdb_instance, :id => 123, :name => "instance1")
    database = FactoryGirl.build(:gpdb_database, :id => 789, :name => "db1", :gpdb_instance => gpdb_instance)
    schema = FactoryGirl.build(:gpdb_schema, :id => 456, :name => "abc", :database => database)
    @dataset = FactoryGirl.build(dataset_factory_name,
      :id => 321,
      :name => "object1",
      :schema => schema
    )
  end

  let(:presenter) { described_class.new(@dataset, view) }
  let(:hash) { presenter.to_hash }

  it "includes gpdb database object fields" do
    hash[:id].should == 321
    hash[:object_name].should == "object1"
    hash[:type].should == "SOURCE_TABLE"
    hash[:associated_workspaces].should_not be_nil

    schema = hash[:schema]
    schema[:id].should == 456
    schema[:name].should == "abc"

    database = schema[:database]
    database[:id].should == 789
    database[:name].should == "db1"

    instance = database[:instance]
    instance[:id].should == 123
    instance[:name].should == "instance1"
  end

  it "checks if the user is allowed to access" do
    hash[:hasCredentials].should_not be_nil
  end

  context "when the 'workspace' option is not passed" do
    it "does not include the 'workspace' key" do
      hash.should_not have_key(:workspace)
    end
  end

  context "when the 'workspace' option is passed" do
    let(:workspace) { FactoryGirl.build(:workspace) }
    let(:presenter) { described_class.new(@dataset, view, :workspace => workspace) }

    before do
      stub(ActiveRecord::Base).current_user { FactoryGirl.build(:user) }
    end

    it "includes the given workspace" do
      hash[:workspace].should == Presenter.present(workspace, view)
    end
  end

  it_behaves_like "sanitized presenter", dataset_factory_name, :name, :object_name
end