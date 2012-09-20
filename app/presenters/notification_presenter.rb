class NotificationPresenter < Presenter
  def to_hash
    presenter_event = EventPresenter.new(model.notification_event, @view_context)
    {
        :id => model.id,
        :recipient => present(model.recipient, @options),
        :event => presenter_event.simple_hash,
        :comment => present(model.comment),
        :unread => !(model.read),
        :timestamp => model.created_at
    }
  end
end