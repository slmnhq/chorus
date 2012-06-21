class Legacy::User < Legacy
  self.table_name = 'edc_user'
end

class Legacy::Instance < Legacy
  self.table_name = 'edc_instance'

  def hadoop?
    instance_provider == 'Hadoop'
  end

  def greenplum?
    instance_provider == 'Greenplum Database'
  end
end

class Legacy::Workfile < Legacy
  self.table_name = 'edc_work_file'
end

class Legacy::Workspace < Legacy
  self.table_name = 'edc_workspace'
end

class Legacy::ActivityStreamObject < Legacy
  self.table_name = 'edc_activity_stream_object'

  belongs_to :object

  # HACK: Skip ActiveRecord's method definition for object_id column,
  # so it doesn't interfere with Ruby's internal object_id method.
  class << self
    protected
    def define_method_attribute(attr_name)
      super(attr_name) unless attr_name == 'object_id'
    end

    private
    def define_external_attribute_method(attr_name)
      super(attr_name) unless attr_name == 'object_id'
    end
  end
end

class Legacy::ActivityStream < Legacy
  def self.table_name
    'edc_activity_stream'
  end

  belongs_to :workspace, :class_name => 'Legacy::Workspace', :foreign_key => 'workspace_id'

  has_many :activity_stream_objects, :class_name => 'Legacy::ActivityStreamObject', :conditions => "object_type <> 'actor'"

  has_one :instance_activity_stream_objects, :class_name => 'Legacy::ActivityStreamObject', :conditions => {:object_type => 'object', :entity_type => 'instance'}
  has_one :workfile_activity_stream_objects, :class_name => 'Legacy::ActivityStreamObject', :conditions => {:object_type => 'object', :entity_type => 'workfile'}
  has_one :actor_activity_stream_object, :class_name => 'Legacy::ActivityStreamObject', :conditions => {:object_type => 'actor'}

  has_one :actor, :through => :actor_activity_stream_object, :source => :object, :class_name => 'Legacy::User'
  has_one :instance, :through => :instance_activity_stream_objects, :source => :object, :class_name => 'Legacy::Instance'
  has_one :workfile, :through => :workfile_activity_stream_objects, :source => :object, :class_name => 'Legacy::Workfile'

  delegate :greenplum?, :hadoop?, :to => :instance, :prefix => true, :allow_nil => true

  def rails_greenplum_instance_id
    instance.try(:chorus_rails_instance_id) if instance_greenplum?
  end

  def rails_hadoop_instance_id
    instance.try(:chorus_rails_instance_id) if instance_hadoop?
  end

  def rails_workfile_id
    workfile.try(:chorus_rails_workfile_id)
  end
end
