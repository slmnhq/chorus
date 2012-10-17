class WorkfileVersion < ActiveRecord::Base
  attr_accessible :commit_message, :owner, :modifier, :contents, :version_num
  has_attached_file :contents,
                    :styles => {:icon => "50x50>"},
                    :path => Chorus::Application.config.chorus['assets_storage_path'] + ":class/:id/:style/:basename.:extension",
                    :url => "/:class/:id/image?style=:style", :restricted_characters => /[&$+,\/:;=?@<>\[\]\{\}\|\\\^~%#]/

  belongs_to :workfile, :touch => true
  belongs_to :owner, :class_name => 'User'
  belongs_to :modifier, :class_name => 'User'
  before_post_process :check_file_type

  before_validation :init_version_number, :on => :create

  after_validation :clean_content_errors

  validates_attachment_size :contents, :less_than => Chorus::Application.config.chorus['file_sizes_mb']['workfiles'].megabytes, :message => :file_size_exceeded

  after_create do
    workfile.update_attributes!({:latest_workfile_version_id => id}, :without_protection => true)

    if version_num == 1
      workfile.update_attributes!({:content_type => file_type}, :without_protection => true)
    end
  end

  def check_file_type
    image?
  end

  def file_name
    contents.original_filename
  end

  CODE_EXTENSIONS = ["cpp", "r"]

  def extension
    file_name = contents.original_filename || ''
    File.extname(file_name)[1..-1].try(:downcase)
  end

  def file_type
    if image?
      "image"
    elsif code?
      "code"
    elsif sql?
      "sql"
    elsif text?
      "text"
    else
      "other"
    end
  end

  def image?
    content_type && content_type.include?('image')
  end

  def text?
    content_type && content_type.include?('text')
  end

  def sql?
    extension == "sql"
  end

  def code?
    CODE_EXTENSIONS.include?(extension)
  end

  def content_type
    contents.content_type
  end

  def update_content(new_content)
    if latest_version?
      File.open(contents.path, "w") do |file|
        file.write new_content
      end
    else
      errors.add(:version, :invalid)
      raise ActiveRecord::RecordInvalid.new(self)
    end
  end

  def get_content
    File.read(contents.path) if text? || sql?
  end

  private

  def latest_version?
    version_num == workfile.latest_workfile_version.version_num
  end

  def clean_content_errors
    if errors[:contents].present?
      errors.delete(:contents)
      errors.add(:contents, :invalid)
    end
  end

  def init_version_number
    self.version_num ||= 1
  end
end
