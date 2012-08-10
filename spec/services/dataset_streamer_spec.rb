require 'spec_helper'

describe DatasetStreamer, :database_integration => true do
  let(:database) { GpdbDatabase.find_by_name_and_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance)}
  let(:dataset) { database.find_dataset_in_schema("base_table1", "test_schema") }
  let(:user) { GpdbIntegration.real_gpdb_account.owner }
  let(:streamer) { DatasetStreamer.new(dataset, user) }

  before do
    refresh_chorus
  end

  describe "#initialize" do
    it "takes a dataset and user" do
      streamer.user.should == user
      streamer.dataset.should == dataset
    end
  end

  describe "#enum" do
    let(:table_data) { ["0,0,0,apple,2012-03-01 00:00:02\n",
                    "1,1,1,apple,2012-03-02 00:00:02\n",
                    "2,0,2,orange,2012-04-01 00:00:02\n",
                    "3,1,3,orange,2012-03-05 00:00:02\n",
                    "4,1,4,orange,2012-03-04 00:02:02\n",
                    "5,0,5,papaya,2012-05-01 00:02:02\n",
                    "6,1,6,papaya,2012-04-08 00:10:02\n",
                    "7,1,7,papaya,2012-05-11 00:10:02\n",
                    "8,1,8,papaya,2012-04-09 00:00:02\n" ] }

    it "returns an enumerator that yields the header and rows from the dataset in csv" do
      enumerator = streamer.enum

      next_result = enumerator.next
      header_row = next_result.split("\n").first
      header_row.should == "id,column1,column2,category,time_value"

      first_result = next_result.split("\n").last+"\n"
      table_data.delete(first_result).should_not be_nil
      8.times do
        table_data.delete(enumerator.next).should_not be_nil
      end
    end

    context "with quotes in the data" do
      let(:dataset) { database.find_dataset_in_schema("stream_table_with_quotes", "test_schema3") }

      it "escapes quotes in the csv" do
        enumerator = streamer.enum
        enumerator.next.split("\n").last.should == %Q{1,"with""double""quotes",with'single'quotes,"with,comma"}
      end
    end

    context "with row_limit" do
      let(:row_limit) { 3 }
      let(:streamer) { DatasetStreamer.new(dataset, user, row_limit) }

      it "uses the limit for the query" do
        enumerator = streamer.enum

        expect {
          row_limit.times do
            enumerator.next
          end
        }.to_not raise_error(StopIteration)

        expect {
          enumerator.next
        }.to raise_error(StopIteration)
      end
    end

    context "for connection errors" do
      it "returns the error message" do
        any_instance_of(GpdbSchema) do |schema|
          stub(schema).with_gpdb_connection(anything) {
            raise ActiveRecord::JDBCError, "Some friendly error message"
          }
        end

        enumerator = streamer.enum
        enumerator.next.should == "Some friendly error message"
      end
    end

    context "for a dataset with no rows" do
      let(:dataset) { database.find_dataset_in_schema("stream_empty_table", "test_schema3") }

      it "returns the error message" do
        enumerator = streamer.enum
        enumerator.next.should == "The requested dataset contains no rows"
      end
    end
  end
end
