class HdfsEntry < ActiveRecord::Base

  belongs_to :hadoop_instance

  validates_uniqueness_of :path, :scope => :hadoop_instance_id

  attr_accessor :highlighted_attributes, :search_result_notes
  searchable :unless => :is_directory do
    text :name, :stored => true, :boost => SOLR_PRIMARY_FIELD_BOOST
    text :parent_name, :stored => true, :boost => SOLR_SECONDARY_FIELD_BOOST
    string :grouping_id
    string :type_name
  end

  def name
    File.basename(path)
  end

  def parent_name
    File.basename(File.dirname(path))
  end

  def parent_path
    File.dirname(path)
  end

  def highlighted_attributes
    @highlighted_attributes.merge(:path => [highlighted_path])
  end

  def highlighted_path
    dir = @highlighted_attributes.has_key?(:parent_name) ? @highlighted_attributes[:parent_name].first : parent_name

    *rest, dir_name, file_name = path.split("/")
    rest << dir
    rest.join('/')
  end

  def self.list(path, hadoop_instance)
    hdfs_query = Hdfs::QueryService.new(hadoop_instance.host, hadoop_instance.port, hadoop_instance.username, hadoop_instance.version)
    hdfs_query.list(path).map do |result|
      result['modified_at'] = Time.parse(result['modified_at'])
      hdfs_entry = hadoop_instance.hdfs_entries.find_or_initialize_by_path(result["path"])
      hdfs_entry.assign_attributes(result, :without_protection => true)
      hdfs_entry.save!
      hdfs_entry
    end
  end

  def file
    unless is_directory
      HdfsFile.new(path, hadoop_instance, {
          :modified_at => modified_at
      })
    end
  end
end
