class AddAttachmentImageToWorkspaces < ActiveRecord::Migration
  def change
    add_column :workspaces, :image_file_name, :string
    add_column :workspaces, :image_content_type, :string
    add_column :workspaces, :image_file_size, :integer
    add_column :workspaces, :image_updated_at, :datetime
  end
end
