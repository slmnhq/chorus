class NoteAttachment < ActiveRecord::Base
  attr_accessible :contents

  has_attached_file :contents, :path => Chorus::Application.config.chorus['attachment_storage'] + ":class/:id/:basename.:extension",
                    :url => "/:class/:id/attachment",
                    :default_url => ""

  belongs_to :note, :class_name => 'Events::Note'
end
