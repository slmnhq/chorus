class ChorusWorker < QC::Worker
  def call(job)
    ActiveRecord::Base.establish_connection
    super
  ensure
    ActiveRecord::Base.connection.try(:disconnect!)
  end

  def thread_pool_size
    Chorus::Application.config.chorus['worker_threads'].to_i
  end
end