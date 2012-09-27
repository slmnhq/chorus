class ChorusWorker < QC::Worker
  def thread_pool_size
    Chorus::Application.config.chorus['worker_threads'].to_i
  end

  def handle_failure(job, e)
    cleaner = ::ActiveSupport::BacktraceCleaner.new
    cleaner.add_filter { |line| line.gsub(Rails.root.to_s, '') }
    log :level => :error, :job => job_description(job), :exception => e.message, :backtrace => "\n" + cleaner.clean(e.backtrace).join("\n")
  end
end