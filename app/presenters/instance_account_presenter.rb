class InstanceAccountPresenter < Presenter
  delegate :id, :db_username, :owner_id, :instance_id, :owner, to: :model

  def to_hash
    {
      :id => id,
      :db_username => h(db_username),
      :owner_id => owner_id,
      :instance_id => instance_id,
      :owner => present(owner)
    }
  end
end