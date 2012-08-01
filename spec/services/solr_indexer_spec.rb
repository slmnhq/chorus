require 'spec_helper'

describe SolrIndexer, :database_integration do
  before do
    @real_gpdb_account = instance_accounts(:chorus_gpdb42_gpadmin)
    Instance.where("name NOT LIKE 'chorus_gpdb%'").destroy_all
    Dataset.destroy_all
    refresh_chorus
  end

  let(:instance_41) { instances(:chorus_gpdb41) }
  let(:instance_42) { instances(:chorus_gpdb42) }
  let(:database) { GpdbDatabase.find_by_name(GpdbIntegration.database_name) }
  let(:test_schema) { database.schemas.find_by_name("test_schema") }

  describe ".index" do
    subject { SolrIndexer.index }
    let(:stale_dataset_name) { 'table_to_drop_for_solr_indexer' }
    let!(:stale_dataset) { GpdbTable.create!({:name => stale_dataset_name, :schema => test_schema}, :without_protection => true) }

    before do
      mock(Dataset).solr_index
      mock(Sunspot).remove(stale_dataset)
      mock(Sunspot).commit
    end

    it "should mark datasets as stale" do
      subject
      stale_dataset.reload.should be_stale
    end

    it "should refresh the databases (and permissions) for all instances" do
      database.instance_accounts.should be_empty
      subject
      database.reload.instance_accounts.should_not be_empty
    end

    it "should refresh the schemas/datasets for all instances" do
      subject
      database.schemas.find_by_name("test_schema").datasets.where(['id != ?', stale_dataset.id]).each do |dataset|
        dataset.should_not be_stale
      end
    end
  end
end
