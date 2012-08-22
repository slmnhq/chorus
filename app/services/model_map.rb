module ModelMap
  UnknownEntityType = Class.new(StandardError)

  CLASS_MAP = {
    "greenplum_instance" => Instance,
    "hdfs_file" => HdfsEntry,
    "hadoop_instance" => HadoopInstance,
    "workspace" => Workspace,
    "dataset" => Dataset,
    "workfile" => Workfile,
    "user" => User
  }

  def self.model_from_params(entity_type, entity_id)
    model_class = CLASS_MAP[entity_type]
    raise UnknownEntityType unless model_class
    model_class.from_param(entity_id)
  end
end
