class InstanceCredentialPresenter < Presenter
  delegate :id, :username, :owner_id, :instance_id, to: :model
  def to_hash
    {
      :id => id,
      :username => username,
      :owner_id => owner_id,
      :instance_id => instance_id,
    }
  end
end