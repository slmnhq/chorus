class ChorusWorker < QC::Worker
  def thread_pool_size
    Chorus::Application.config.chorus['worker_threads'].to_i
  end
end