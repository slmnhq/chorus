class GpdbInstanceWorkspaceDetailPresenter < Presenter
  delegate :used_by_workspaces, to: :model

  def to_hash
    account = model.account_for_user(current_user)
    return results_hash(nil, nil) unless account

    recommended_gb = Chorus::Application.config.chorus['sandbox_recommended_size_in_gb']
    recommended_bytes = recommended_gb * 1024 * 1024 * 1024

    workspaces = []
    total_size_in_bytes = 0

    used_by_workspaces(current_user).each do |workspace|
      sandbox_size = workspace.sandbox.disk_space_used(account)
      total_size_in_bytes += sandbox_size || 0

      workspaces << {
          :id => workspace.id,
          :name => h(workspace.name),
          :size_in_bytes => sandbox_size,
          :size => format_size(sandbox_size),
          :percentage_used => sandbox_size ? (sandbox_size / recommended_bytes.to_f * 100).round : nil,
          :owner_full_name => workspace.owner.full_name,
          :schema_name => workspace.sandbox.name,
          :database_name => workspace.sandbox.database.name
      }
    end
    results_hash(workspaces, total_size_in_bytes)
  end

  def complete_json?
    true
  end

  private

  def format_size(size)
    @view_context.number_to_human_size(size)
  end

  def results_hash(workspaces, sandbox_size)
    {
        :workspaces => workspaces,
        :sandboxes_size_in_bytes => sandbox_size,
        :sandboxes_size => format_size(sandbox_size)
    }
  end
end
