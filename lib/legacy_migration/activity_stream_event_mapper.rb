class ActivityStreamEventMapper
  def initialize(activity_stream)
    @activity_stream = activity_stream
  end

  def build_event
    event = event_class.new
    set_target_objects(event)
    set_additional_data(event)
    event
  end

  def can_build?
    event_class.present?
  end

  private

  def event_class
    if @activity_stream.type == 'INSTANCE_CREATED'
      instance_event_class
    elsif @activity_stream.type == 'WORKSPACE_CREATED'
      workspace_create_event_class
    elsif @activity_stream.type == 'IMPORT_SUCCESS'
      import_success_event_class
    elsif @activity_stream.type == 'IMPORT_FAILED'
      import_failed_event_class
    else
      "Events::#{@activity_stream.type}".constantize
    end
  rescue NameError => e
    nil
  end

  def instance_event_class
    if @activity_stream.instance_hadoop?
      Events::HADOOP_INSTANCE_CREATED
    else
      Events::GREENPLUM_INSTANCE_CREATED
    end
  end

  def workspace_create_event_class
    if Workspace.find_with_destroyed(@activity_stream.chorus_rails_workspace_id).public
      Events::PUBLIC_WORKSPACE_CREATED
    else
      Events::PRIVATE_WORKSPACE_CREATED
    end
  end

  def import_success_event_class
    if @activity_stream.indirect_verb == 'of file'
      Events::FILE_IMPORT_SUCCESS
    else
      Events::DATASET_IMPORT_SUCCESS
    end
  end

  def import_failed_event_class
    if @activity_stream.indirect_verb == 'of file'
      Events::FILE_IMPORT_FAILED
    else
      Events::DATASET_IMPORT_FAILED
    end
  end

  def set_target_objects(event)
    event.class.target_names.each do |target_name|
      event.public_send "#{target_name}=", get_target_object(target_name)
    end
  end

  def get_target_object(target_name)
    case target_name
    when :greenplum_instance
      Instance.find_by_id(@activity_stream.rails_greenplum_instance_id)
    when :hadoop_instance
      HadoopInstance.find_by_id(@activity_stream.rails_hadoop_instance_id)
    when :workfile
      Workfile.find_by_id(@activity_stream.rails_workfile_id)
    when :new_user
      User.find_by_id(@activity_stream.rails_object_user_id)
    when :dataset
      Dataset.find_by_id(@activity_stream.rails_dataset_id)
    when :hdfs_file
      hadoop_instance_id, path = @activity_stream.hadoop_instance_id
      HdfsFileReference.find_or_create_by_path({ :hadoop_instance_id => hadoop_instance_id,
                                                 :path => path })
    when :member
      member_id, @member_num_added = @activity_stream.rails_member_id_and_count
      User.find_by_id(member_id)
    end
  end

  def set_additional_data(event)
    event.additional_data = {}
    if event.class == Events::FILE_IMPORT_SUCCESS
      event.additional_data[:filename] = @activity_stream.file_name
      event.additional_data[:import_type] = "file"
    elsif event.class == Events::FILE_IMPORT_FAILED
      event.additional_data[:filename] = @activity_stream.file_name
      event.additional_data[:import_type] = "file"
      event.additional_data[:destination_table] = @activity_stream.destination_table
      event.additional_data[:error_message] = "#{@activity_stream.import_error_message}"
    elsif event.class == Events::DATASET_IMPORT_FAILED
      event.additional_data[:destination_table] = Dataset.find_by_id(@activity_stream.rails_dataset_id_for_import_destination).name
      event.additional_data[:source_dataset] = Dataset.find_by_id(@activity_stream.rails_dataset_id_for_import_source)
      event.additional_data[:error_message] = "#{@activity_stream.import_error_message}"
    elsif event.class == Events::DATASET_IMPORT_SUCCESS
      event.additional_data[:dataset] = Dataset.find_by_id(@activity_stream.rails_dataset_id_for_import_destination)
      event.additional_data[:source_dataset] = Dataset.find_by_id(@activity_stream.rails_dataset_id_for_import_source)
    elsif event.class == Events::MEMBERS_ADDED
      event.additional_data[:num_added] = @member_num_added.to_s
    end
  end
end
