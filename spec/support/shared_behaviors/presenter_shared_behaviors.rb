shared_examples "sanitized presenter" do |factory_name, field_to_sanitize, presented_field = field_to_sanitize|
  it "sanitizes #{field_to_sanitize}" do
    bad_value = "<script>alert('got your cookie')</script>"

    presented = FactoryGirl.build factory_name, field_to_sanitize => bad_value
    json = described_class.new(presented, view).to_hash

    json[presented_field].should_not match "<"
  end
end

shared_examples "database object presenter" do |database_object_factory_name|
  before do
    instance = FactoryGirl.build(:instance, :id => 123, :name => "instance1")
    database = FactoryGirl.build(:gpdb_database, :id => 789, :name => "db1", :instance => instance)
    schema = FactoryGirl.build(:gpdb_schema, :id => 456, :name => "abc", :database => database)
    @database_object = FactoryGirl.build(database_object_factory_name, :id => 321, :name => "object1", :schema => schema)
  end

  let(:presenter) { described_class.new(@database_object, view) }
  let(:hash) { presenter.to_hash }

  it "includes gpdb database object fields" do
    hash[:id].should == 321
    hash[:object_name].should == "object1"
    hash[:type].should == "SOURCE_TABLE"

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

  it_behaves_like "sanitized presenter", database_object_factory_name, :name, :object_name
end
