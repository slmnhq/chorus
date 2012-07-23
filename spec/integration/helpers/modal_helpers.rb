def within_modal(&block)
  modal_selector = "#facebox"
  wait_until { page.has_selector?(modal_selector) }
  wait_for_ajax
  within(modal_selector, &block)
  wait_for_ajax
end