require 'clockwork'
require 'queue_classic'

class JobScheduler
  include Clockwork

  def initialize
    every(Chorus::Application.config.chorus['instance_poll_interval_minutes'].minutes, 'InstanceStatus.check') do
      QC.enqueue("InstanceStatus.check")
    end

    every(Chorus::Application.config.chorus['delete_unimported_csv_files_interval_hours'].hours, 'CsvFile.delete_old_files!') do
      QC.enqueue("CsvFile.delete_old_files!")
    end

    every(Chorus::Application.config.chorus['reindex_datasets_interval_hours'].hours, 'SolrIndexer.refresh_and_index') do
      QC.enqueue("SolrIndexer.refresh_and_index", [])
    end
  end

  def job_named(job)
    @@events.find { |event|
      event.job == job
    }
  end

  def self.run
    JobScheduler.new.run
  end
end