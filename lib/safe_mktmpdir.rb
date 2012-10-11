module SafeMktmpdir
  def self.mktmpdir(*args)
    temp_dir = Dir.mktmpdir(*args)
    FileUtils.chmod 0755, temp_dir

    if block_given? && temp_dir
      begin
        value = yield temp_dir
      ensure
        FileUtils.rm_r temp_dir or raise "Could not remove temporary directory: #{temp_dir}"
        value
      end
    else
      temp_dir
    end
  end
end
