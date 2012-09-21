module InstanceStatus

  def self.each_instance(instances)
    instances.each do |instance|
      begin
        #TODO - rename online in HadoopInstance also to state
        if (instance.class.name == "HadoopInstance")
          instance.online = false
        else
          instance.state = "offline" if instance.state == "online"
        end
        yield instance
      rescue => e
        Rails.logger.error "Could not check status: #{e}: #{e.message} on #{e.backtrace[0]}"
      ensure
        instance.touch
        instance.save
      end
    end
  end

  def self.check
    check_hdfs_instances
    check_gpdb_instances
  end

  def self.check_hdfs_instances
    each_instance(HadoopInstance.scoped) do |instance|
      check_hdfs_instance(instance)
    end
  end

  def self.check_gpdb_instances
    each_instance(GpdbInstance.scoped) do |gpdb_instance|
      check_gpdb_instance(gpdb_instance)
    end
  end

  private

  def self.check_hdfs_instance(instance)
    check_with_exponential_backoff(instance) do
      version = Hdfs::QueryService.instance_version(instance)
      if version
        instance.version = version
        instance.online = true
      end
    end
  end

  def self.check_gpdb_instance(gpdb_instance)
    check_with_exponential_backoff(gpdb_instance) do
      Gpdb::ConnectionBuilder.connect!(gpdb_instance, gpdb_instance.owner_account) do |conn|
        gpdb_instance.state = "online"
        version_string = conn.exec_query("select version()")[0]["version"]
        # if the version string looks like this:
        # PostgreSQL 9.2.15 (Greenplum Database 4.1.1.2 build 2) on i386-apple-darwin9.8.0 ...
        # then we just want "4.1.1.2"
        gpdb_instance.version = version_string.match(/Greenplum Database ([\d\.]*)/)[1]
      end
    end
  end

  def self.downtime_before_last_check(gpdb_instance)
    gpdb_instance.last_checked_at - gpdb_instance.last_online_at
  end

  def self.maximum_check_interval
    1.day
  end

  def self.next_check_time(gpdb_instance)
    return 1.minute.ago if gpdb_instance.last_online_at.blank?
    [gpdb_instance.last_online_at + downtime_before_last_check(gpdb_instance)* 2,
     gpdb_instance.last_checked_at + maximum_check_interval].min
  end

  def self.check_with_exponential_backoff(model, &block)
    next if Time.current < next_check_time(model)
    model.touch(:last_checked_at)
    success = yield block
    model.last_online_at = model.last_checked_at if success
    model.save!
  end
end

