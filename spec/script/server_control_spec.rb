require "timeout"

describe "Server control" do
  let(:root) { File.expand_path('../../../', __FILE__) }
  let(:command) { "RAILS_ENV=test CHORUS_HOME=#{root} #{root}/script/server_control.sh" }

  describe "before starting the services" do
    specify "no processes are running" do
      pid_for_process("script/clock.rb").should be_empty
      pid_for_process("QC::Worker").should be_empty
      pid_for_process("solr.*start.jar").should be_empty
    end
  end

  describe "starting the services" do
    before do
      puts `#{command} start`
    end

    after do
      puts `#{command} stop`
    end

    it "starts all the processes" do
      saved_clock_pid = File.read(root + '/tmp/pids/clock.test.pid').strip
      running_clock_pid = pid_for_process("script/clock.rb")

      saved_worker_pid = File.read(root + '/tmp/pids/queue_classic.test.pid').strip
      running_worker_pid = pid_for_process("QC::Worker")

      running_solr_pid = wait_for_pid('solr.*start.jar', 15)

      running_worker_pid.should == saved_worker_pid
      running_clock_pid.should == saved_clock_pid
      running_solr_pid.should_not be_empty
    end

    describe "when a process dies" do
      let(:clock_pid) { pid_for_process("script/clock.rb") }

      before do
        `kill #{clock_pid}`
      end

      it "restarts the process" do
        puts `#{command} start`

        new_clock_pid = wait_for_pid('script/clock.rb')

        new_clock_pid.should_not == clock_pid
        new_clock_pid.should_not be_empty
      end
    end
  end

  def pid_for_process(process_string)
    `ps x | grep #{process_string} | grep -v grep | cut -f 1 -d' '`.strip
  end

  def wait_for_pid(process_string, timeout=1)
    pid = ''

    Timeout.timeout(timeout) do
      while pid.empty?
        pid = pid_for_process(process_string)
        sleep 0.1
      end
    end

    pid
  rescue Timeout::Error
    raise "timed out waiting for #{process_string} to start"
  end
end
