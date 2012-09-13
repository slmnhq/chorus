require 'spec_helper'

describe GpdbColumn do
  describe ".columns_for" do
    subject { GpdbColumn.columns_for(account, dataset) }

    context "with real data", :database_integration do
      let(:gpdb_instance) { GpdbIntegration.real_gpdb_instance }
      let(:account) { GpdbIntegration.real_gpdb_account }
      let(:database) { gpdb_instance.databases.find_by_name(GpdbIntegration.database_name) }

      context "view/table" do
        let(:dataset) { database.find_dataset_in_schema('base_table1', 'test_schema') }

        it "gets the column information for table users" do
          id = subject.first

          id.name.should eq('id')
          id.data_type.should eq('integer')
          id.description.should be_blank
          id.ordinal_position.should eq(1)
        end

        it "gets the column stats for table users" do
          column1 = subject[2]

          stats = column1.statistics
          stats.should be_a GpdbColumnStatistics
          stats.null_fraction.should be_present
          stats.number_distinct.should be_present
          stats.common_values.should be_present
        end
      end

      context "with a real chorus view" do
        let(:schema) { database.schemas.find_by_name('test_schema') }
        let(:dataset) {
          view = ChorusView.new
          view.name = "myChorusView"
          view.schema = schema
          view.query = "SELECT * FROM base_table1;"
          view.save!
          view
        }

        it "gets the column information" do
          subject.count.should == 5
          row = subject.first
          row.name.should eq('id')
          row.data_type.should eq('int4')
        end

        it "deletes the temporary table when it is done" do
          schema.datasets.find_by_name("tmp_tbl").should == nil
        end
      end
    end

    describe "with fake data" do
      before do
        #{"attname"=>"notes", "format_type"=>"text", "description"=>nil, "attnum"=>11, "null_frac"=>nil, "n_distinct"=>nil,
        #"most_common_vals"=>nil, "most_common_freqs"=>nil, "histogram_bounds"=>nil, "reltuples"=>0.0}
        mock(Gpdb::ConnectionBuilder).connect!(gpdb_instance, account, dataset.schema.database.name) do
          [
              {"attname" => 'email', "format_type" => 'varchar(255)', "description" => 'it must be present',
               "attnum" => 1, "null_frac" => '1stats1', "n_distinct" => '1stats2', "most_common_vals" => '1stats3',
               "most_common_freqs" => '1stats4', "histogram_bounds" => '1stats5', "reltuples" => '1rows1'},
              {"attname" => 'age', "format_type" => 'integer', "description" => 'nothing awesome',
               "attnum" => 2, "null_frac" => '2stats1', "n_distinct" => '2stats2', "most_common_vals" => '2stats3',
               "most_common_freqs" => '2stats4', "histogram_bounds" => '2stats5', "reltuples" => '2rows1'}
          ]
        end
      end
      let(:gpdb_instance) { gpdb_instances(:bobs_instance) }
      let(:account) { instance_accounts(:bobo) }
      let(:dataset) { datasets(:bobs_table) }

      it "returns a collections of columns" do
        subject.should have(2).columns
      end

      it "gets column comment and column position" do
        first_column = subject.first
        first_column.description.should eq("it must be present")
        first_column.ordinal_position.should eq(1)
      end

      it "initializes column stats with correct parameters" do
        mock(GpdbColumnStatistics).new('1stats1', '1stats2', '1stats3', '1stats4', '1stats5', '1rows1', false) {}
        mock(GpdbColumnStatistics).new('2stats1', '2stats2', '2stats3', '2stats4', '2stats5', '2rows1', true) {}
        subject
      end

      it "associates column stats objects with their column" do
        fake_stats = Object.new
        stub(GpdbColumnStatistics).new { fake_stats }
        subject.first.statistics.should be fake_stats
      end
    end
  end

  describe "#number_or_time?" do
    it "is true if it is a numeric column" do
      GpdbColumn.new(:data_type => "integer").should be_number_or_time
      GpdbColumn.new(:data_type => "numeric").should be_number_or_time
      GpdbColumn.new(:data_type => "double precision").should be_number_or_time
    end

    it "is true if it is a time column" do
      GpdbColumn.new(:data_type => "date").should be_number_or_time
      GpdbColumn.new(:data_type => "time with time zone").should be_number_or_time
      GpdbColumn.new(:data_type => "timestamp with time zone").should be_number_or_time
    end

    it "is false otherwise" do
      GpdbColumn.new(:data_type => "text").should_not be_number_or_time
    end
  end

  describe "#simplified_type" do
    subject { GpdbColumn.new(:data_type => type_string) }

    def self.it_simplifies_type(type, simplified_type)
      context "with a '#{type}' column" do
        let(:type_string) { type }
        its(:simplified_type) { should == simplified_type }
      end
    end

    it_simplifies_type("complex", nil)
    it_simplifies_type("numeric", :decimal)
    it_simplifies_type("integer[]", :string)
    it_simplifies_type("bigint", :integer)
    it_simplifies_type("bit(5)", :string)
    it_simplifies_type("bit varying(10)", :string)
    it_simplifies_type("boolean", :boolean)
    it_simplifies_type("box", :string)
    it_simplifies_type("bytea", :binary)
    it_simplifies_type("character varying(10)", :string)
    it_simplifies_type("character(10)", :string)
    it_simplifies_type("cidr", :string)
    it_simplifies_type("circle", :string)
    it_simplifies_type("date", :date)
    it_simplifies_type("double precision", :float)
    it_simplifies_type("inet", :string)
    it_simplifies_type("integer", :integer)
    it_simplifies_type("interval", :string)
    it_simplifies_type("lseg", :string)
    it_simplifies_type("macaddr", :string)
    it_simplifies_type("money", :decimal)
    it_simplifies_type("numeric(5,5)", :decimal)
    it_simplifies_type("path", :string)
    it_simplifies_type("point", :string)
    it_simplifies_type("polygon", :string)
    it_simplifies_type("real", :float)
    it_simplifies_type("smallint", :integer)
    it_simplifies_type("text", :text)
    it_simplifies_type("time without time zone", :time)
    it_simplifies_type("time with time zone", :time)
    it_simplifies_type("timestamp without time zone", :datetime)
    it_simplifies_type("timestamp with time zone", :datetime)
  end
end
