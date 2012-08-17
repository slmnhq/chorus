class NoteAttachment < ActiveRecord::Base
  attr_accessible :contents

  has_attached_file :contents, :path => Chorus::Application.config.chorus['attachment_storage'] + ":class/:id/:style/:basename.:extension",
                    :url => "/notes/:note_id/attachments/:id?style=:style",
                    :default_url => "",
                    :styles => { :original => "", :icon => "50x50>" }

  before_post_process :contents_are_image?

  belongs_to :note, :class_name => 'Events::Note'

  def contents_are_image?
    MIME::Types.type_for(contents_file_name).first.to_s.starts_with?('image/')
  end
end
