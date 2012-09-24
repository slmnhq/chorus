class InstanceStatusChecker
  attr_accessor :instance
  delegate :last_online_at, :last_checked_at, :state, :touch, :to => :instance

  def self.check
    check_hdfs_instances
    check_gpdb_instances
  end

  def self.check_hdfs_instances
    check_each_instance(HadoopInstance.scoped)
  end

  def self.check_gpdb_instances
    check_each_instance(GpdbInstance.scoped)
  end

  def check
    begin
      #TODO - rename online in HadoopInstance also to state
      if instance.is_a?(HadoopInstance)
        instance.online = false
        check_hdfs_instance
      else
        instance.state = "offline" if state == "online"
        check_gpdb_instance
      end
    rescue => e
      # TODO: we should specify which exceptions we are actually expecting from JDBC and HDFS
      Rails.logger.error "Could not check status: #{e}: #{e.message} on #{e.backtrace[0]}"
    ensure
      instance.touch
      instance.save!
    end
  end

  private

  def self.check_each_instance(instances)
    instances.each do |instance|
      new(instance).check
    end
  end

  def initialize(instance)
    @instance = instance
  end

  def check_hdfs_instance
    check_with_exponential_backoff do
      version = Hdfs::QueryService.instance_version(instance)
      if version
        instance.version = version
        instance.online = true
      end
    end
  end

  def check_gpdb_instance
    check_with_exponential_backoff do
      Gpdb::ConnectionBuilder.connect!(instance, instance.owner_account) do |conn|
        instance.state = "online"
        version_string = conn.exec_query("select version()")[0]["version"]
        # if the version string looks like this:
        # PostgreSQL 9.2.15 (Greenplum Database 4.1.1.2 build 2) on i386-apple-darwin9.8.0 ...
        # then we just want "4.1.1.2"
        instance.version = version_string.match(/Greenplum Database ([\d\.]*)/)[1]
      end
    end
  end

  def downtime_before_last_check
    last_checked_at - last_online_at
  end

  def maximum_check_interval
    1.day
  end

  def next_check_time
    return 1.minute.ago if last_online_at.blank?
    next_check_at = last_online_at + downtime_before_last_check * 2
    must_check_by = last_checked_at + maximum_check_interval
    [next_check_at, must_check_by].min
  end

  def check_with_exponential_backoff(&block)
    return if Time.current < next_check_time
    touch(:last_checked_at)
    success = yield block
    instance.last_online_at = last_checked_at if success
  end
end

