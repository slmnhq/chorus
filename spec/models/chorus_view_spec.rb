require "spec_helper"

describe ChorusView do
  let(:schema) { gpdb_schemas(:bobs_schema) }

  describe "#query" do
    context "with invalid query" do
      it "should raise error when having invalid query" do
        any_instance_of(GpdbSchema) do |schema|
          mock(schema).with_gpdb_connection.with_any_args { raise ActiveRecord::StatementInvalid }
        end

        expect { described_class.create!({:name => "invalid_query",:schema => schema,
                                          :query => "select * from some_table"}, :without_protection => true) }.to raise_error(ActiveRecord::StatementInvalid)
      end

      it "should start with select or with" do
        expect { described_class.create!({:name => "invalid_query", :schema => schema,
                                          :query => "this is not a query"}, :without_protection => true) }.to raise_error(ActiveRecord::StatementInvalid)
      end
    end

    context "with valid query" do
      before do
        any_instance_of(GpdbSchema) do |schema|
          mock(schema).with_gpdb_connection.with_any_args
        end
      end
      it "should not return error when query starts with 'WITH' " do
        chorus_view = ChorusView.create!({:name => "query", :schema => schema, :query => "With a"}, :without_protection => true)
        chorus_view.query.should == "With a"
      end

      it "should not return error when query starts with 'SELECT' " do
        chorus_view = ChorusView.create!({:name => "query", :schema => schema, :query => "selecT 1;"}, :without_protection => true)
        chorus_view.query.should == "selecT 1;"
      end

      it "should only return ChorusView" do
        ChorusView.create!({:name => "query", :schema => schema, :query => "select 1;"}, :without_protection => true)
        Dataset.chorus_views("query").count == 1
      end
    end
  end
end
