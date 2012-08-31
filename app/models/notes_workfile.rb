class NotesWorkfile < ActiveRecord::Base
  belongs_to :event, :class_name => 'Events::Base', :foreign_key => 'note_id'
  belongs_to :workfile
end