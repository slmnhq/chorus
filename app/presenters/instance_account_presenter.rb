class InstanceAccountPresenter < Presenter
  delegate :id, :db_username, :owner_id, :gpdb_instance_id, :owner, to: :model

  def to_hash
    {
      :id => id,
      :db_username => h(db_username),
      :owner_id => owner_id,
      :instance_id => gpdb_instance_id,
      :owner => present(owner)
    }
  end

  def complete_json?
    true
  end
end