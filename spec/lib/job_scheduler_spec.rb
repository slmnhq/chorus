require 'spec_helper'
require 'job_scheduler'

describe JobScheduler do
  let(:job_scheduler) { JobScheduler.new }
  describe "InstanceStatusChecker.check" do
    it "runs every Chorus::Application.config.chorus['instance_poll_interval_minutes'] minutes" do
      job_scheduler.job_named('InstanceStatusChecker.check').period.should == Chorus::Application.config.chorus['instance_poll_interval_minutes'].minutes
    end

    it "enqueues the 'InstanceStatusChecker.check' job in QC" do
      mock(QC.default_queue).enqueue("InstanceStatusChecker.check")
      job_scheduler.job_named('InstanceStatusChecker.check').run(Time.now)
    end
  end

  describe "CsvFile.delete_old_files!" do
    it "runs every Chorus::Application.config.chorus['delete_unimported_csv_files_interval_hours'] hours" do
      job_scheduler.job_named('CsvFile.delete_old_files!').period.should == Chorus::Application.config.chorus['delete_unimported_csv_files_interval_hours'].hours
    end

    it "enqueues the 'CsvFile.delete_old_files!' job in QC" do
      mock(QC.default_queue).enqueue("CsvFile.delete_old_files!")
      job_scheduler.job_named('CsvFile.delete_old_files!').run(Time.now)
    end
  end

  describe "SolrIndexer.refresh_external_data" do
    it "runs every Chorus::Application.config.chorus['reindex_datasets_interval_hours'] hours" do
      job_scheduler.job_named('SolrIndexer.refresh_external_data').period.should == Chorus::Application.config.chorus['reindex_datasets_interval_hours'].hours
    end

    it "enqueues the 'SolrIndexer.refresh_external_data' job in QC" do
      mock(QC.default_queue).enqueue("SolrIndexer.refresh_external_data")
      job_scheduler.job_named('SolrIndexer.refresh_external_data').run(Time.now)
    end
  end

  describe "ImportScheduler" do
    it "runs every minute" do
      job_scheduler.job_named('ImportScheduler.run').period.should == 1.minute
    end

    it "runs the ImportScheduler in the same thread" do
      mock(ImportScheduler).run
      job_scheduler.job_named('ImportScheduler.run').run(Time.now)
    end
  end

  describe "JobScheduler.run" do
    it "builds a JobScheduler and then runs it starts the clockwork" do
      built = false
      any_instance_of(JobScheduler) do |js|
        mock(js).run
        built = true
      end
      JobScheduler.run
      built.should be_true
    end
  end
end

module Clockwork
  class Event
    attr_reader :period
  end
end