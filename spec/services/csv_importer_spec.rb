require 'tempfile'
require 'spec_helper'

describe CsvImporter, :database_integration => true do
  before do
    refresh_chorus
  end

  let(:schema) { GpdbSchema.find_by_name('test_schema') }
  let(:user) { account.owner }
  let(:account) { real_gpdb_account }

  it "imports a basic csv file as a new table" do
    f = Tempfile.new("test_csv")
    f.puts "1,foo\n2,bar\n3,baz\n"
    f.close
    csv_file = CsvFile.new(:contents => f,
                              :column_names => [:id, :name],
                              :types => [:integer, :varchar],
                              :delimiter => ',',
                              :header => true,
                              :to_table => "new_table_from_csv")
    csv_file.user = user
    csv_file.save!

    c = CsvImporter.new(csv_file)
    c.import_using(schema)

    schema.with_gpdb_connection(account) do |connection|
      result = connection.exec_query("select * from new_table_from_csv order by ID asc;")
      result[0].should == {"id" => 1, "name" => "foo"}
      result[1].should == {"id" => 2, "name" => "bar"}
      result[2].should == {"id" => 3, "name" => "baz"}
    end
  end

  it "imports a file with different column names, header rows and a different delimiter" do
    f = Tempfile.new("test_csv")
    f.puts "ignore\tme\n1\tfoo\n2\tbar\n3\tbaz\n"
    f.close

    csv_file = CsvFile.create(:contents => f,
                              :column_names => [:id, :dog],
                              :types => [:integer, :varchar],
                              :delimiter => "\t",
                              :header => false,
                              :to_table => "another_new_table_from_csv")
    csv_file.user = user
    csv_file.save!

    c = CsvImporter.new(csv_file)
    c.import_using(schema)


    schema.with_gpdb_connection(account) do |connection|
      result = connection.exec_query("select * from another_new_table_from_csv order by ID asc;")
      result[0].should == {"id" => 1, "dog" => "foo"}
      result[1].should == {"id" => 2, "dog" => "bar"}
      result[2].should == {"id" => 3, "dog" => "baz"}
    end
  end
end