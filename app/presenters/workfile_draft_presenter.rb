class WorkfileDraftPresenter < Presenter
  delegate :content, :id, :owner_id, :workfile_id, :to => :model

  def to_hash
    {
      :content => h(content),
      :id => id,
      :owner_id => owner_id,
      :workfile_id => workfile_id
    }
  end
end