class HdfsEntry < ActiveRecord::Base
  include Stale

  attr_accessible :path, :hadoop_instance_id

  has_many :activities, :as => :entity
  has_many :events, :through => :activities

  belongs_to :hadoop_instance
  belongs_to :parent, :class_name => HdfsEntry, :foreign_key => 'parent_id'
  has_many :children, :class_name => HdfsEntry, :foreign_key => 'parent_id', :dependent => :destroy

  validates_uniqueness_of :path, :scope => :hadoop_instance_id
  validates_presence_of :hadoop_instance
  validates_format_of :path, :with => %r{\A/.*}

  scope :files, where(:is_directory => false)

  attr_accessor :highlighted_attributes, :search_result_notes
  searchable :unless => lambda { |model| model.is_directory? || model.stale? } do
    text :name, :stored => true, :boost => SOLR_PRIMARY_FIELD_BOOST
    text :parent_name, :stored => true, :boost => SOLR_SECONDARY_FIELD_BOOST
    string :grouping_id
    string :type_name
  end

  before_save :build_full_path, :on_create => true

  def self.from_param(param)
    hadoop_instance_id, path = param.split('|')
    self.find_or_create_by_hadoop_instance_id_and_path(hadoop_instance_id, path)
  end

  def name
    File.basename(path)
  end

  def parent_name
    File.basename(File.dirname(path))
  end

  def ancestors
    #return @ancestors if @ancestors
    @ancestors = []
    if parent
      puts "parent is #{parent.inspect}"
      parent_name = parent.path == '/' ? hadoop_instance.name : parent.name
      @ancestors << {:name => parent_name, :id => parent_id}
      @ancestors += parent.ancestors
    end
    @ancestors
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

  def modified_at=(new_time)
    if modified_at != new_time
      super
    end
  end

  def self.list(path, hadoop_instance)
    hdfs_query = Hdfs::QueryService.new(hadoop_instance.host, hadoop_instance.port, hadoop_instance.username, hadoop_instance.version)
    current_entries = hdfs_query.list(path).map do |result|
      hdfs_entry = hadoop_instance.hdfs_entries.find_or_initialize_by_path(result["path"])
      hdfs_entry.stale_at = nil if hdfs_entry.stale?
      hdfs_entry.hadoop_instance = hadoop_instance
      hdfs_entry.assign_attributes(result, :without_protection => true)
      hdfs_entry.save! if hdfs_entry.changed?
      hdfs_entry
    end

    parent = hadoop_instance.hdfs_entries.find_by_path(normalize_path(path))
    current_entry_ids = current_entries.map(&:id)
    finder = parent.children
    finder = finder.where(['id not in (?)', current_entry_ids]) unless current_entry_ids.empty?
    finder.each do |hdfs_entry|
      hdfs_entry.mark_stale!
      next unless hdfs_entry.is_directory?
      hadoop_instance.hdfs_entries.where("stale_at IS NULL AND path LIKE ?", "#{hdfs_entry.path}/%").find_each do |entry_to_mark_stale|
        entry_to_mark_stale.mark_stale!
      end
    end

    current_entries
  end

  def entries
    HdfsEntry.list(path.chomp('/') + '/', hadoop_instance)
  end

  def contents
    hdfs_query = Hdfs::QueryService.new(hadoop_instance.host, hadoop_instance.port, hadoop_instance.username, hadoop_instance.version)
    hdfs_query.show(path)
  end

  def file
    unless is_directory?
      HdfsFile.new(path, hadoop_instance, {
          :modified_at => modified_at
      })
    end
  end

  def parent_path
    File.dirname(path)
  end

  private

  def self.normalize_path(path)
    Pathname.new(path).cleanpath.to_s
  end

  def build_full_path
    return true if path == "/"
    self.parent = hadoop_instance.hdfs_entries.find_or_create_by_path(parent_path)
    self.parent.is_directory = true
    self.parent.save!
  end
end
