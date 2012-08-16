class HadoopInstance < ActiveRecord::Base
  attr_accessible :name, :host, :port, :description, :username, :group_list
  belongs_to :owner, :class_name => 'User'
  has_many :activities, :as => :entity
  has_many :events, :through => :activities
  has_many :hdfs_entries
  validates_presence_of :name, :host, :port

  def url
    "gphdfs://#{host}:#{port}/"
  end

  def refresh(path = "/")
    entries = HdfsEntry.list(path, self)
    entries.each { |entry| refresh(entry.path) if entry.is_directory? }
  end
end
