class WorkspacePresenter < Presenter
  delegate :id, :name, :summary, :owner, :archiver, :archived_at, :public, :image, :sandbox, :permissions_for, :has_added_member, :has_added_workfile, :has_added_sandbox, :has_changed_settings, to: :model

  def to_hash
    if rendering_activities?
      {
          :id => id,
          :name => h(name)
      }
    elsif @options[:size_only]
      account = sandbox.account_for_user!(current_user)
      sandbox_size = sandbox.disk_space_used(account)
      recommended_gb = Chorus::Application.config.chorus['sandbox_recommended_size_in_gb']
      recommended_bytes = recommended_gb * 1024 * 1024 * 1024
      result = {
          :size => nil,
          :percentage_used => nil,
          :owner_full_name => "#{owner.first_name} #{owner.last_name}",
          :schema_name => sandbox.name,
          :database_name => sandbox.database.name
      }
      if sandbox_size
        result.merge({
          :size => @view_context.number_to_human_size(sandbox_size),
          :percentage_used => (sandbox_size / recommended_bytes.to_f * 100).round
        })
      end
      result
    else
      {
          :id => id,
          :name => h(name),
          :summary => sanitize(summary),
          :owner => present(owner),
          :archiver => present(archiver),
          :archived_at => archived_at,
          :public => public,
          :image => present(image),
          :permission => permissions_for(current_user),
          :has_added_member => has_added_member,
          :has_added_workfile => has_added_workfile,
          :has_added_sandbox => has_added_sandbox,
          :has_changed_settings => has_changed_settings,
          :sandbox_info => present(sandbox),
          :latest_comment_list => nil   # temporarily added for rspec fixture - needed by JS specs
      }
    end
  end

  def complete_json?
    !rendering_activities?
  end
end
