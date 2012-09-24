require 'spec_helper'

describe GpdbColumn do
  describe ".columns_for", :database_integration do
    subject { GpdbColumn.columns_for(account, dataset) }

    let(:gpdb_instance) { GpdbIntegration.real_gpdb_instance }
    let(:account) { GpdbIntegration.real_gpdb_account }
    let(:database) { gpdb_instance.databases.find_by_name(GpdbIntegration.database_name) }

    describe 'for a real table' do
      let(:dataset) { database.find_dataset_in_schema('base_table1', 'test_schema') }

      it "gets the column information for table users" do
        subject.count.should == 5
        column1 = subject[1]

        column1.name.should eq('column1')
        column1.data_type.should eq('integer')
        column1.description.should == 'comment on column1'
        column1.ordinal_position.should eq(2)
      end

      it "gets the column stats for table users" do
        column1 = subject[1]
        column1_stats = column1.statistics

        column1_stats.should be_a GpdbColumnStatistics
        column1_stats.null_fraction.should == 0.0
        column1_stats.number_distinct.should == 2
        column1_stats.common_values.should =~ %w(0 1)
      end

      it 'has the correct column type for time values' do
        time_column = subject.last
        time_column.simplified_type.should == :datetime
        time_column.should be_number_or_time
      end
    end

    describe "for a chorus view" do
      let(:schema) { database.schemas.find_by_name('test_schema') }
      let(:dataset) { datasets(:executable_chorus_view) }

      it "gets the column information" do
        subject.count.should == 5
        row = subject.first
        row.name.should eq('id')
        row.data_type.should eq('integer')
      end

      it 'has the correct column type for time values' do
        time_column = subject.last
        time_column.simplified_type.should == :datetime
        time_column.should be_number_or_time
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
