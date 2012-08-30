require 'legacy_migration_spec_helper'

describe ChorusViewMigrator do

  before :all do
    ChorusViewMigrator.migrate
  end

  it "should migrate all chorus views and be idempotent" do
    legacy_chorus_views = Legacy.connection.exec_query(%Q(select * from edc_dataset where type = 'CHORUS_VIEW'))
    Dataset.chorus_views.count.should == legacy_chorus_views.count
    ChorusViewMigrator.migrate
    Dataset.chorus_views.count.should == legacy_chorus_views.count

  end

  it "should have a query for every migrated chorus view" do
    Dataset.chorus_views.where('query IS NULL').should be_empty
  end
end